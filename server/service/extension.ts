export const queryBrowser = async (context:any, messageId:string|number, prompt:string) => {
    const { pendingRequests, extensionSocket } = context
    return await new Promise((resolve, reject) => {
        // Guardamos la función "resolve" en el mapa usando el ID
        pendingRequests.set(messageId, resolve);

        // Configuramos un tiempo límite (ej. 60 segundos) por si Ai tarda mucho o hay un error
        setTimeout(() => {
            if (pendingRequests.has(messageId)) {
                pendingRequests.delete(messageId);
                reject(new Error('Timeout: Ai tardó demasiado en responder'));
            }
        }, 60000);

        // Enviamos el comando a la extensión a través del WebSocket
        const payload = JSON.stringify({
            action: 'prompt',
            message: prompt,
            id: messageId
        });
        extensionSocket.send(payload)
    });

}

export const preparePrompt = (messages: any[], quantity:number = -1) => {
    let finalPrompt = "";
    messages.slice(quantity).forEach(msg => {
        finalPrompt += `${msg.role.toUpperCase()}:\n`;
        if (typeof msg.content === 'string') {
            finalPrompt += `${msg.content}\n\n`;
        }
        // 2. Si el contenido es un Array (Trae, Cursor, envío de múltiples archivos)
        else if (Array.isArray(msg.content)) {
            msg.content.forEach( (part:any) => {
                if (part.type === 'text' && part.text) {
                    finalPrompt += `${part.text}\n`;
                } else if (part.type === 'image_url') {
                    finalPrompt += `\n[SISTEMA: El usuario adjuntó una imagen aquí, pero la conexión actual solo soporta texto. Indícale al usuario que no puedes ver imágenes y pídele que te describa el problema o te comparta el código directamente.]\n`;
                    console.log("⚠️ Imagen Base64 interceptada y omitida para no romper el navegador.");
                } else if (typeof part === 'string') {
                    finalPrompt += `${part}\n`;
                } else {
                    // Si el IDE envía un formato de objeto distinto, lo convertimos a texto JSON
                    finalPrompt += `${JSON.stringify(part)}\n`;
                }
            });
            finalPrompt += `\n\n`;
        }
        // 3. Fallback para objetos no esperados
        else {
            finalPrompt += `${JSON.stringify(msg.content)}\n\n`;
        }
    });

    return finalPrompt
}


export const baseMessage = (messageId:any, model:string, created?:any) => {
    return {
        id: `chatcmpl-${messageId}`,
        object: 'chat.completion.chunk',
        model: model,
        created: created || Math.floor(Date.now() / 1000),
    }
}