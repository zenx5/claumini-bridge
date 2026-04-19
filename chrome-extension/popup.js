document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusText = document.getElementById('connectionStatus');

  // 1. Cargar configuración y estado guardado
  chrome.storage.sync.get(['serverUrl', 'inputSelector', 'buttonSelector', 'responseSelector', 'bridgeEnabled'], (data) => {
    document.getElementById('serverUrl').value = data.serverUrl || 'ws://localhost:3000';
    document.getElementById('inputSelector').value = data.inputSelector || 'rich-textarea';
    document.getElementById('buttonSelector').value = data.buttonSelector || 'button.send-button';
    document.getElementById('responseSelector').value = data.responseSelector || 'message-content .markdown';
    
    updateUI(data.bridgeEnabled || false);
  });

  // 2. Guardar configuración
  document.getElementById('saveBtn').addEventListener('click', () => {
    const config = {
      serverUrl: document.getElementById('serverUrl').value,
      inputSelector: document.getElementById('inputSelector').value,
      buttonSelector: document.getElementById('buttonSelector').value,
      responseSelector: document.getElementById('responseSelector').value
    };
    chrome.storage.sync.set(config, () => {
      document.getElementById('status').textContent = '¡Configuración guardada!';
      setTimeout(() => { document.getElementById('status').textContent = ''; }, 2000);
    });
  });

  // 3. 🔴 Lógica del botón Conectar/Desconectar
  toggleBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['bridgeEnabled'], (data) => {
      const newState = !data.bridgeEnabled; // Invertimos el estado actual
      
      // Guardamos el nuevo estado
      chrome.storage.sync.set({ bridgeEnabled: newState }, () => {
        updateUI(newState);
        
        // Le avisamos a la pestaña de la IA que actúe
        chrome.tabs.query({ url: "*://gemini.google.com/*" }, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'toggleConnection', enabled: newState });
          });
        });
      });
    });
  });

  // Función visual para cambiar el color del botón
  function updateUI(isEnabled) {
    if (isEnabled) {
      statusText.textContent = 'En línea';
      statusText.style.color = 'green';
      toggleBtn.textContent = 'Apagar Puente';
      toggleBtn.style.background = '#d32f2f'; // Rojo
    } else {
      statusText.textContent = 'Apagado';
      statusText.style.color = 'gray';
      toggleBtn.textContent = 'Encender Puente';
      toggleBtn.style.background = '#0b57d0'; // Azul
    }
  }
});