/* eslint-disable */

import type { ChangeEvent, FC } from 'react';
import React, {
  useRef, useCallback, useLayoutEffect
} from 'react';
import focusEditableElement from './util/focusEditableElement'
import { EDITABLE_INPUT_ID } from './config'
import { isHeavyAnimating } from './hooks/useHeavyAnimationCheck'
import './MessageInput.css'



// Focus slows down animation, also it breaks transition layout in Chrome
const FOCUS_DELAY_MS = 350;

type OwnProps = {
  html: string;
  placeholder: string;
  onUpdate: (html: string) => void;
  onSend: () => void;
};


// For some reason Safari inserts `<br>` after user removes text from input
const SAFARI_BR = '<br>';

const messageSendKeyCombo = 'enter'

const MessageInput: FC<OwnProps> = ({
  html,
  placeholder,
  onUpdate,
  onSend,
}) => {

  // eslint-disable-next-line no-null/no-null
  const inputRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (html !== inputRef.current!.innerHTML) {
      inputRef.current!.innerHTML = html;
    }
  }, [html])

  const focusInput = useCallback(() => {
    if (!inputRef.current) {
      return;
    }

    if (isHeavyAnimating()) {
      setTimeout(focusInput, FOCUS_DELAY_MS);
      return;
    }

    focusEditableElement(inputRef.current!);
  }, []);

  const onBlur = useCallback(() => {
    focusInput()
  }, [])

  function handleChange(e: ChangeEvent<HTMLDivElement>) {
    const { innerHTML } = e.currentTarget;

    onUpdate(innerHTML === SAFARI_BR ? '' : innerHTML);
    
    document.dispatchEvent(new CustomEvent('selectionchange', {detail: {}}))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // https://levelup.gitconnected.com/javascript-events-handlers-keyboard-and-load-events-1b3e46a6b0c3#1960

    if (!html.length && (e.metaKey || e.ctrlKey)) {
      const targetIndexDelta = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : undefined;
      if (targetIndexDelta) {
        e.preventDefault();
        return;
      }
    }

    if ( e.key === 'Enter' && !e.shiftKey) {
      if (messageSendKeyCombo === 'enter' && !e.shiftKey){
        e.preventDefault();

        onSend();
      }
    } else if ( e.key === 'ArrowUp' && !html.length && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
    }
  }


  return (
    <div
      ref={inputRef}
      id={EDITABLE_INPUT_ID}
      className={"scrollbars-hidden"}
      contentEditable
      role="textbox"
      dir="auto"
      onClick={focusInput}
      onChange={handleChange}
      onInput={handleChange}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  );
};

export default MessageInput;