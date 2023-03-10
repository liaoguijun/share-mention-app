import { useState, useCallback } from 'react';
import MessageInput from './MessageInput';
import Tooltip from './Tooltip'
import useMentionTooltip from './hooks/useMentionTooltip';
import './index.css';
import parseMessageInput from './util/parseMessageInput'

const groupChatMembers = [{userId: '1'},{userId: '2'}]

const currentUserId = '100001'

export const usersById = {
    "1": {
        id: '1',
        type: "userTypeRegular",
        firstName: '张三第三款减肥可乐三等奖',
        usernames: [{username:'张三第三款减肥可乐三等奖', isActive: true}]
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

    const handleSend = useCallback( async () => {
        const { text, entities } = parseMessageInput(html);
        console.log(text)
        console.log(entities)
        let textReplace = text

        if(entities) {
            for(let i = entities.length - 1; i >= 0; i--) {
                // @ts-ignore
                const { offset, length, userId } = entities[i]
                textReplace = replacepos(textReplace, offset, offset + length - 1, `@<${userId}>`)
            }
        }

        console.log(textReplace)

        function replacepos(text: string,start: number, stop: number, replacetext: string){
            return text.substring(0,start-1)+replacetext+text.substring(stop+1);
        }

    }, [html])

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
                onSend={handleSend}
            />
        </>
    )
}
