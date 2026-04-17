
export const onMessage = (context:any) => (message:any) => {
    const { pendingRequests } = context
    try {
        const data = JSON.parse(message);
        if (data.action === 'reply' && data.id) {
            console.log(`Recibida respuesta para el ID: ${data.id}`);
            // Si hay una petición HTTP esperando esta respuesta, la resolvemos
            if (pendingRequests.has(data.id)) {
                const resolveHttpRequest = pendingRequests.get(data.id);
                resolveHttpRequest(data.reply); // Esto envía la respuesta HTTP a tu app
                pendingRequests.delete(data.id); // Limpiamos la memoria
            }
        }
    } catch (error) {
        console.error('Error procesando el mensaje del WebSocket:', error);
    }
}