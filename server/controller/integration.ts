import type { Response, Request } from "express";
import { baseMessage, preparePrompt, queryBrowser } from "../service/extension.ts";
import { formatStandardResponse } from "../service/ai.ts";
import { queryController } from "./extension.ts";

export const sendOpenAIStream = (res: Response, baseChunk: any, content: string, stopReason = 'stop') => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const write = (data: any) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    write({ ...baseChunk, choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }] });
    write({ ...baseChunk, choices: [{ index: 0, delta: { content }, finish_reason: null }] });
    write({ ...baseChunk, choices: [{ index: 0, delta: {}, finish_reason: stopReason }] });
    res.write(`data: [DONE]\n\n`);
    return res.end();
};

export const integrationQuery = (context: any) => async (req: Request, res: Response) => {
    const { extensionSocket } = context
    const { messages, model, stream } = req.body;
    const messageId = Date.now().toString();

    // 1. Validaciones (Controlador)
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: true, messsage: 'Formato inválido. Se esperaba un array de "messages".' });
    if (!extensionSocket || extensionSocket.readyState !== WebSocket.OPEN) return res.status(503).json({ error: true, message: 'La extensión de Chrome no está conectada.' });

    const baseChunk = baseMessage(messageId, model || "ai-web-bridge", )

    try {
        const finalPrompt = preparePrompt(messages);
        const aiResponse = await queryBrowser(context, messageId, finalPrompt) as string
        const finalContent = aiResponse || "⚠️ No se pudo extraer la respuesta.";

        // 3. Respuesta (Controlador)
        if (stream) return sendOpenAIStream(res, baseChunk, finalContent);
        return res.json(formatStandardResponse(baseChunk, finalContent));

    } catch (error: any) {
        if (stream) return sendOpenAIStream(res, baseChunk, error.message, 'timeout_error');
        return res.status(504).json(formatStandardResponse(baseChunk, error.message, 'timeout_error'));
    }
};

export const single = (context:any) => async (req:Request, res:Response) => {
    const { extensionSocket } = context
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Debes enviar un "prompt" en el body.' });
    }

    if ( !extensionSocket || extensionSocket.readyState !== WebSocket.OPEN ) {
        return res.status(503).json({ error: 'La extensión de Chrome no está conectada al servidor.' });
    }

    const data = await queryController(context, prompt)

    res.status(data.success ? 200 : 504).send(data)
}