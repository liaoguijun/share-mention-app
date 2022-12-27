import React, { useState, useCallback } from 'react';
import './index.css';
import MessageInput from './MessageInput';
import Tooltip from './Tooltip'
import { EDITABLE_INPUT_ID } from './config'
import { ApiAttachment } from './types/misc'
import { IS_SINGLE_COLUMN_LAYOUT, EDITABLE_INPUT_CSS_SELECTOR } from './environment'
import useFlag from './hooks/useFlag';
import { processMessageInputForCustomEmoji } from './util/customEmojiManager';
import useMentionTooltip from './hooks/useMentionTooltip';

const groupChatMembers = [{userId: '1'},{userId: '2'}]

const topInlineBotIds = undefined;

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

    const [attachments, setAttachments] = useState<ApiAttachment[]>([]);

    const [isSymbolMenuOpen, openSymbolMenu, closeSymbolMenu] = useFlag();

    const setHtml = useCallback((newHtml: string) => {
        setInnerHtml(newHtml);
        requestAnimationFrame(() => {
            processMessageInputForCustomEmoji();
        });
    }, []);

    const {
        isMentionTooltipOpen, closeMentionTooltip, insertMention, mentionFilteredUsers,
    } = useMentionTooltip(
        !attachments.length,
        EDITABLE_INPUT_CSS_SELECTOR,
        setHtml,
        groupChatMembers,
        topInlineBotIds,
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
                id="message-input-text"
                editableInputId={EDITABLE_INPUT_ID}
                html={!attachments.length ? html : ''}
                placeholder={'Write a message'}
                shouldSuppressFocus={IS_SINGLE_COLUMN_LAYOUT && isSymbolMenuOpen}
                shouldSuppressTextFormatter={isMentionTooltipOpen}
                onUpdate={setHtml}
                onSend={() => {}}
            />
        </>
    )
}
