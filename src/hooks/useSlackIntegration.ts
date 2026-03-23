// hooks/useSlackIntegration.ts
import { useState } from 'react';
import { SlackClient } from '../lib/slack/slackClient';
import { SlackCallbackManager } from '../lib/slack/callbackManager';
import { useAuth } from './useAuth';


export const useSlackIntegration = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // إرسال طلب موافقة على مهمة
    const sendTaskApprovalRequest = async (taskId: string, taskTitle: string, channelId: string) => {
        setIsLoading(true);

        try {
            // إنشاء Callback ID
            const callbackId = await SlackCallbackManager.create({
                type: 'task',
                targetId: taskId,
                userId: user?.id || ''
            });

            // إرسال رسالة تفاعلية إلى Slack
            const slackClient = new SlackClient(process.env.SLACK_WEBHOOK_URL!);

            await slackClient.sendInteractiveMessage({
                channelId,
                text: `📋 *طلب الموافقة على مهمة*\n\n*المهمة:* ${taskTitle}\n*المطلوب:* يرجى الموافقة أو الرفض`,
                callbackId,
                actions: [
                    {
                        name: 'approve',
                        text: '✅ موافقة',
                        type: 'button',
                        value: taskId
                    },
                    {
                        name: 'reject',
                        text: '❌ رفض',
                        type: 'button',
                        value: taskId
                    }
                ]
            });

            return { success: true, callbackId };
        } catch (error) {
            console.error('Error sending Slack request:', error);
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    };

    // معالجة رد Slack (Callback)
    const handleSlackCallback = async (payload: any) => {
        const callbackId = payload.callback_id || payload.block_id;

        if (!callbackId) return;

        // التحقق من صحة الـ Callback ID
        const callback = await SlackCallbackManager.verify(callbackId);

        if (!callback) {
            console.error('Invalid or expired callback ID');
            return;
        }

        // تحديث الحالة
        await SlackCallbackManager.updateStatus(callbackId, 'completed');

        // تنفيذ الإجراء بناءً على نوع الـ callback
        const action = payload.actions?.[0];

        if (action?.action_id === 'approve') {
            // تحديث المهمة في قاعدة البيانات
            await supabase
                .from('tasks')
                .update({ status: 'approved' })
                .eq('id', callback.target_id);
        } else if (action?.action_id === 'reject') {
            await supabase
                .from('tasks')
                .update({ status: 'rejected' })
                .eq('id', callback.target_id);
        }
    };

    return {
        sendTaskApprovalRequest,
        handleSlackCallback,
        isLoading
    };
};