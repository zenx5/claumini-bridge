import { queryBrowser } from "../service/extension.ts";


export const queryController = async (context:any, prompt:string) => {
    const messageId = Date.now().toString();
    console.log(`Enviando prompt a Ai (ID: ${messageId}): "${prompt}"`);
    try {
        const aiResponse = await queryBrowser(context, messageId, prompt)
        return {
            success: true,
            reply: aiResponse
        }
    } catch (error:any) {
        return {
            success: false,
            reply: error.message
        };
    }

}
