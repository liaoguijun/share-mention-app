import { useState, useCallback } from 'react';
import MessageInput from './MessageInput';
import Tooltip from './Tooltip'
import useMentionTooltip from './hooks/useMentionTooltip';
import './index.css';

const groupChatMembers = [{userId: '1'},{userId: '2'}]

const currentUserId = '100001'

export const usersById = {
    "1": {
        id: '1',
        type: "userTypeRegular",
        firstName: '张三',
        usernames: [{username:'张三', isActive: true}]
    },
    "2": {
        id: '2',
        type: "userTypeRegular",
        firstName: '李四',
        usernames: [{username:'李四', isActive: true}]
    }
}

export default function() {

    const [html, setInnerHtml] = useState<string>('');

    const setHtml = useCallback((newHtml: string) => {
        setInnerHtml(newHtml);
    }, []);

    const {
        isMentionTooltipOpen, closeMentionTooltip, insertMention, mentionFilteredUsers,
    } = useMentionTooltip(
        setHtml,
        groupChatMembers,
        currentUserId,
    );

    return (
        <>
            <Tooltip
                isOpen={isMentionTooltipOpen}
                onClose={closeMentionTooltip}
                onInsertUserName={insertMention}
                filteredUsers={mentionFilteredUsers}
            />
            <MessageInput
                html={html}
                placeholder={'Write a message'}
                onUpdate={setHtml}
                onSend={() => {}}
            />
        </>
    )
}
