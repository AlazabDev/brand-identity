// utils/callbackId.ts
export const generateCallbackId = (): string => {
    return crypto.randomUUID();
};

// أو استخدام تنسيق مخصص لـ Slack
export const generateSlackCallbackId = (type: string, id: string): string => {
    return `slack_${type}_${id}_${Date.now()}`;
};