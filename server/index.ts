import express from 'express'
import http from 'http'
import { WebSocketServer, type WebSocket } from 'ws';
import cors from 'cors';
import { onClose } from './events/close.ts';
import { onMessage } from './events/message.ts';
import generateRouter from './router/main.ts'

const app = express();
const PORT = process.env.PORT || 3000;
const bridgeContext:{
    extensionSocket: WebSocket|null,
    pendingRequests: Map<any, any>
} = {
    extensionSocket : null,
    pendingRequests : new Map(),
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const server = http.createServer(app);

const wss = new WebSocketServer({
    server
})


wss.on('connection',  (ws) => {
    console.log('✅ Extensión de Claumini conectada por WebSocket');
    bridgeContext.extensionSocket = ws;
    ws.on('message', onMessage(bridgeContext));
    ws.on('close', onClose(bridgeContext));
});

app.use(generateRouter(bridgeContext))

server.listen(PORT, () => {
    console.log(`🚀 Servidor puente corriendo en el puerto ${PORT}`);
    console.log(`🔌 WebSocket disponible en: ws://localhost:${PORT}`);
    console.log(`📡 API HTTP disponible en: http://localhost:${PORT}/api/ask-gemini`);
    console.log(`🤖 Endpoint tipo OpenAI: http://localhost:${PORT}/v1/chat/completions`);
});