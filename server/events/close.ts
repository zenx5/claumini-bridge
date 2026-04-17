export const onClose = (context:any) => () => {
    console.log('❌ Extensión desconectada');
    context.extensionSocket = null;
}