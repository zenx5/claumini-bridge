console.log('dddd')
let config = {};
let isProcessing = false;
let socket = null;
let isBridgeEnabled = false;

chrome.storage.sync.get(['serverUrl', 'inputSelector', 'buttonSelector', 'responseSelector', 'bridgeEnabled'], (data) => {
  if (data.serverUrl && data.serverUrl.startsWith('ws')) {
    config = data;
    isBridgeEnabled = data.bridgeEnabled || false;

    if (isBridgeEnabled) {
      connectWebSocket();
    } else {
      console.log("Claumini Bridge: Extensión instalada pero apagada.");
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleConnection') {
    isBridgeEnabled = request.enabled;

    if (isBridgeEnabled) {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
    } else {
      if (socket) {
        socket.close(); // Esto cierra el túnel
        socket = null;
        console.log("Claumini Bridge: Puente apagado manualmente.");
      }
    }
  }
});

// Tools
async function humanWrite(inputEl, text) {
  // Función interna para generar un retraso aleatorio (ej. entre 50ms y 150ms)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let currentText = "";
  const isEditable = inputEl.contentEditable === "true"
  console.log( isEditable ? 'Es editable' : 'No es editable')
  for (const char of text) {
    currentText += char;

    // Actualizamos el elemento según su tipo
    if (isEditable) {
      inputEl.textContent = currentText;
    } else {
      inputEl.value = currentText;
    }

    // Disparamos los eventos para que la web detecte el cambio
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    // Generamos un tiempo de espera aleatorio entre caracteres
    // Ajusta los números (10, 30) para escribir más rápido o más lento
    const randomTime = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
    await delay(randomTime);
  }

  // Al finalizar, lanzamos el evento 'change'
  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
}

// 2. Conexión WebSocket
function connectWebSocket() {
  if (!isBridgeEnabled) return; // Evita reconexiones fantasma si está apagado

  console.log(`Conectando al servidor WebSocket: ${config.serverUrl}...`);
  socket = new WebSocket(config.serverUrl);

  socket.onopen = () => {
    console.log("Claumini Bridge: ¡Conectado al servidor con éxito!");
  };

  socket.onmessage = async (event) => {
    if (isProcessing) return;

    try {
      const data = JSON.parse(event.data);
      if (data.action === 'prompt' && data.message) {
        isProcessing = true;
        await processMessage(data.message, data.id);
      }
    } catch (error) {
      console.error("Error procesando el mensaje del WebSocket:", error);
    }
  };

  socket.onclose = () => {
    socket = null;
    if (isBridgeEnabled) {
      console.log("Claumini Bridge: Desconectado. Reconectando en 5 segundos...");
      setTimeout(connectWebSocket, 5000);
    }
  };

  socket.onerror = (error) => {
    console.error("Error en WebSocket:", error);
  };
}

// 4. Escribir, enviar y esperar respuesta
async function processMessage(text, messageId) {
  console.log(`Escribiendo: ${text}`);

  const inputEl = document.querySelector(config.inputSelector);
  const btnEl = document.querySelector(config.buttonSelector);

  if (!inputEl || !btnEl) {
    console.error("No se encontraron los selectores en la página.");
    isProcessing = false;
    return;
  }

  //  NUEVO: Contamos cuántas respuestas hay ANTES de enviar
  const initialResponseCount = document.querySelectorAll(config.responseSelector).length;

  await humanWrite(inputEl, text)

  setTimeout(async () => {
    btnEl.click();

    // NUEVO: Le pasamos la cantidad inicial a la función
    const replyText = await waitForResponse(initialResponseCount);

    sendReplyToServer(replyText, messageId);
    isProcessing = false;
  }, 500);
}

// 5. Lógica para esperar que la IA termine
async function waitForResponse(initialCount) {
  return new Promise((resolve) => {
    let lastText = "";
    let stableCount = 0;
    let waitingForNewNode = true; // Bandera para saber si estamos esperando el nodo

    const checkInterval = setInterval(() => {
      const responses = document.querySelectorAll(config.responseSelector);

      // 1. ESPERAR A QUE APAREZCA LA NUEVA RESPUESTA
      if (waitingForNewNode) {
        if (responses.length > initialCount) {
          console.log("Claumini Bridge: Nueva respuesta detectada, esperando a que termine...");
          waitingForNewNode = false; // ¡Apareció! Ya podemos empezar a leerla
        } else {
          return; // Si no ha aparecido, no hacemos nada y esperamos un segundo más
        }
      }

      // 2. LEER Y ESPERAR A QUE SE ESTABILICE
      const latestResponse = responses[responses.length - 1].innerText;

      if (latestResponse === lastText && latestResponse.length > 0) {
        stableCount++;
      } else {
        stableCount = 0;
      }

      lastText = latestResponse;

      if (stableCount >= 3) {
        clearInterval(checkInterval);
        resolve(lastText);
      }
    }, 1000);
  });
}

// 6. Enviar de vuelta usando el WebSocket
function sendReplyToServer(reply, id) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload = JSON.stringify({ action: 'reply', id: id, reply: reply });
    socket.send(payload);
    console.log("Respuesta enviada de vuelta por WebSocket.");
  } else {
    console.error("No se pudo enviar la respuesta, el WebSocket está cerrado.");
  }
}