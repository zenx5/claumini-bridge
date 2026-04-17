

export const formatStandardResponse = (baseInfo: any, content: string, finishReason = "stop") => {
    return {
        id: baseInfo.id,
        object: "chat.completion",
        created: baseInfo.created || Math.floor(Date.now() / 1000),
        model: baseInfo.model,
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: content
                },
                finish_reason: finishReason
            }
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
};