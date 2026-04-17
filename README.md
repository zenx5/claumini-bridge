# 🌉 Claumini Bridge

¡Convierte tu cuenta web gratuita de Google Gemini en una API local compatible con el estándar de OpenAI!

**Clamini** es un puente (Proxy) compuesto por un servidor Node.js y una extensión de Chrome que te permite conectar IDEs modernos con IA (como Trae, Cursor, Continue) o librerías (como LangChain, AutoGen) directamente a tu pestaña del navegador, ahorrando costos de API.

---

## ⚠️ Aviso Importante (Disclaimer)
Este es un proyecto **educativo y no oficial**. Interactuar con la interfaz web de Gemini de forma automatizada (Web Scraping/DOM Injection) puede ir en contra de los Términos de Servicio (ToS) de Google y otros proveedores de Inteligencia Artificial.
* El autor no se hacen responsables de bloqueos o suspensiones de cuenta.
* Úsalo bajo tu propia responsabilidad y consideración.
* **🛠️ Selectores Dinámicos a Prueba de Futuro:** Si Google cambia la estructura HTML de su interfaz, ¡no necesitas actualizar el código! Simplemente cambia los selectores CSS directamente desde la interfaz gráfica de la extensión.

---

## ✨ Características

* **🔌 Compatibilidad OpenAI:** Expone un endpoint `/v1/chat/completions` que engaña a tu IDE haciéndole creer que está hablando con OpenAI o LM Studio.
* **⚡ Tiempo Real:** Comunicación ultrarrápida entre el servidor y el navegador mediante WebSockets.
* **🧠 Soporte de Contexto:** Procesa correctamente los arrays complejos de mensajes y metadatos que envían los IDEs.
* **🛡️ Intercepción Segura:** Detecta y descarta intentos de enviar imágenes gigantes en Base64 para evitar el colapso del navegador.
* **🎛️ Control Manual:** Extensión con interfaz para apagar/encender el túnel en un clic.
* **🛠️ Selectores Dinámicos a Prueba de Futuro:** Si Google cambia la estructura HTML de su interfaz, ¡no necesitas actualizar el código! Simplemente cambia los selectores CSS directamente desde la interfaz gráfica de la extensión.


---

## 🚀 Instalación y Configuración

El proyecto consta de dos partes: El **Servidor Local** y la **Extensión de Chrome**.

### 1. Requisitos Previos
* [Node.js](https://nodejs.org/) instalado en tu sistema.
* Navegador Google Chrome, o con soporte para extensiones de chrome.
* Estar logueado en [gemini.google.com](https://gemini.google.com/) en tu navegador o cualquier otro proveedor.

### 2. Levantar el Servidor
Clona este repositorio y navega a la carpeta del servidor:
```bash
    git clone [https://github.com/zenx5/claumini-bridge.git](https://github.com/zenx5/claumini-bridge.git)
    cd claumini-bridge/server
    npm install
    npm start
```
El servidor iniciará en el puerto 3000.

### 3. Instalar la Extensión
 * Abre Chrome y ve a chrome://extensions/.
 * Activa el Modo de desarrollador (interruptor en la esquina superior derecha).
 * Haz clic en Cargar descomprimida (Load unpacked).
 * Selecciona la carpeta extension de este repositorio.
 * Fija el icono de la extensión, haz clic en él y verifica que la configuración apunte a ws://localhost:3000.
 * Configura los selectores CSS si es necesario (vienen preconfigurados para la versión actual de Gemini).
 * Haz clic en "Encender Puente".

## 💻 Uso e Integración
Una vez que el servidor está corriendo y la pestaña de Gemini está abierta con la extensión conectada, puedes configurar cualquier herramienta de IA.

En IDEs (Trae, Cursor, etc.)
Busca la configuración de modelos personalizados (Custom Models / OpenAI Compatible API) y establece:
 * **Base URL:** http://localhost:3000/
 * **API Key:** dummy-key (Puedes escribir cualquier cosa, el servidor no la valida).
 * **Model Name:** claumini-web (El nombre es ignorado por el puente).

Con Python (OpenAI SDK)
```Python
    from openai import OpenAI

    client = OpenAI(
        base_url="http://localhost:3000/",
        api_key="no-necesita-key"
    )

    response = client.chat.completions.create(
        model="claumini-web",
        messages=[{"role": "user", "content": "Hola, ¿estás conectado?"}]
    )

    print(response.choices[0].message.content)
```

## 🛠️ Solución de Problemas
 * **Error 503 / La extensión no está conectada:** Asegúrate de tener una pestaña abierta en gemini.google.com o tu proveedor y que el botón de la extensión esté en "Encendido". Si el servidor se reinició, simplemente recarga la pestaña de Gemini.
 * **El IDE muestra la respuesta vacía:** Verifica que la versión de tu servidor incluye el soporte simulado para stream: true mediante Server-Sent Events.
 * **Imágenes no soportadas:** Actualmente, el puente descarta las imágenes Base64 enviadas por el IDE. Debes pasarle texto o fragmentos de código directamente.

## 🤝 Contribuciones
¡Las contribuciones (Pull Requests) son bienvenidas!
Especialmente si encuentras formas de optimizar la selección del DOM, mejorar el manejo de errores o agregar soporte para subir archivos simulando la interfaz de Gemini.

## 📄 Licencia
Distribuido bajo la Licencia MIT. Consulta el archivo LICENSE para más información.