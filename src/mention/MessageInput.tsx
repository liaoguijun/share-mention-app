/* eslint-disable */

import type { ChangeEvent, FC } from 'react';
import React, {
  useEffect, useRef, memo, useState, useCallback, useLayoutEffect
} from 'react';
import type { ISettings, IAnchorPosition } from './types';
import buildClassName from './util/buildClassName'
import focusEditableElement from './util/focusEditableElement'
import { EDITABLE_INPUT_ID } from './config'
import { isHeavyAnimating } from './hooks/useHeavyAnimationCheck'
import useFlag from './hooks/useFlag';
import { IS_TOUCH_ENV, IS_EMOJI_SUPPORTED, IS_IOS, IS_ANDROID } from './environment'
import { getActions, withGlobal } from './global';
import { isSelectionInsideInput } from './helper/selection'
import parseEmojiOnlyString from './util/parseEmojiOnlyString'
import './MessageInput.css'



const CONTEXT_MENU_CLOSE_DELAY_MS = 100;
// Focus slows down animation, also it breaks transition layout in Chrome
const FOCUS_DELAY_MS = 350;
const TRANSITION_DURATION_FACTOR = 50;

const SCROLLER_CLASS = 'input-scroller';

type OwnProps = {
  id: string;
  chatId?: string;
  threadId?: number;
  isAttachmentModalInput?: boolean;
  editableInputId?: string;
  html: string;
  placeholder: string;
  forcedPlaceholder?: string;
  noFocusInterception?: boolean;
  canAutoFocus?: boolean;
  shouldSuppressFocus?: boolean;
  shouldSuppressTextFormatter?: boolean;
  onUpdate: (html: string) => void;
  onSuppressedFocus?: () => void;
  onSend: () => void;
  captionLimit?: number;
};

type StateProps = {
  replyingToId?: number;
  isSelectModeActive?: boolean;
  messageSendKeyCombo?: ISettings['messageSendKeyCombo'];
};

const MAX_INPUT_HEIGHT = true ? 256 : 416;
const MAX_ATTACHMENT_MODAL_INPUT_HEIGHT = 240;
const TAB_INDEX_PRIORITY_TIMEOUT = 2000;
// Heuristics allowing the user to make a triple click
const SELECTION_RECALCULATE_DELAY_MS = 260;
const TEXT_FORMATTER_SAFE_AREA_PX = 90;
// For some reason Safari inserts `<br>` after user removes text from input
const SAFARI_BR = '<br>';
const IGNORE_KEYS = [
  'Esc', 'Escape', 'Enter', 'PageUp', 'PageDown', 'Meta', 'Alt', 'Ctrl', 'ArrowDown', 'ArrowUp', 'Control', 'Shift',
];

function clearSelection() {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  if (selection.removeAllRanges) {
    selection.removeAllRanges();
  } else if (selection.empty) {
    selection.empty();
  }
}

const MessageInput: FC<OwnProps & StateProps> = ({
  id,
  chatId,
  captionLimit,
  isAttachmentModalInput,
  editableInputId,
  html,
  placeholder,
  forcedPlaceholder,
  canAutoFocus,
  noFocusInterception,
  shouldSuppressFocus,
  shouldSuppressTextFormatter,
  replyingToId,
  isSelectModeActive,
  messageSendKeyCombo,
  onUpdate,
  onSuppressedFocus,
  onSend,
}) => {

  const {
    editLastMessage,
    replyToNextMessage,
  } = getActions();

  // eslint-disable-next-line no-null/no-null
  const inputRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line no-null/no-null
  const selectionTimeoutRef = useRef<number>(null);

  const isContextMenuOpenRef = useRef(false);

  const [isTextFormatterOpen, openTextFormatter, closeTextFormatter] = useFlag();

  const [isTextFormatterDisabled, setIsTextFormatterDisabled] = useState<boolean>(false);
  const [textFormatterAnchorPosition, setTextFormatterAnchorPosition] = useState<IAnchorPosition>();
  const [selectedRange, setSelectedRange] = useState<Range>();

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

  function handleChange(e: ChangeEvent<HTMLDivElement>) {
    const { innerHTML, textContent } = e.currentTarget;

    onUpdate(innerHTML === SAFARI_BR ? '' : innerHTML);

    // Reset focus on the input to remove any active styling when input is cleared
    if (
      !IS_TOUCH_ENV
      && (!textContent || !textContent.length)
      // When emojis are not supported, innerHTML contains an emoji img tag that doesn't exist in the textContext
      && !(!IS_EMOJI_SUPPORTED && innerHTML.includes('emoji-small'))
      && !(innerHTML.includes('custom-emoji'))
    ) {
      const selection = window.getSelection()!;
      if (selection) {
        inputRef.current!.blur();
        selection.removeAllRanges();
        focusEditableElement(inputRef.current!, true);
      }
    }
    
    document.dispatchEvent(new CustomEvent('selectionchange', {detail: {}}))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // https://levelup.gitconnected.com/javascript-events-handlers-keyboard-and-load-events-1b3e46a6b0c3#1960
    // @ts-ignore
    const { isComposing } = e;

    if (!isComposing && !html.length && (e.metaKey || e.ctrlKey)) {
      const targetIndexDelta = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : undefined;
      if (targetIndexDelta) {
        e.preventDefault();

        replyToNextMessage({ targetIndexDelta });
        return;
      }
    }

    if (!isComposing && e.key === 'Enter' && !e.shiftKey) {
      if (
        !(IS_IOS || IS_ANDROID)
        && (
          (messageSendKeyCombo === 'enter' && !e.shiftKey)
          || (messageSendKeyCombo === 'ctrl-enter' && (e.ctrlKey || e.metaKey))
        )
      ) {
        e.preventDefault();

        closeTextFormatter();
        onSend();
      }
    } else if (!isComposing && e.key === 'ArrowUp' && !html.length && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      editLastMessage();
    } else {
      e.target.addEventListener('keyup', processSelectionWithTimeout, { once: true });
    }
  }

  function processSelectionWithTimeout() {
    if (selectionTimeoutRef.current) {
      window.clearTimeout(selectionTimeoutRef.current);
    }
    // Small delay to allow browser properly recalculate selection
    // @ts-ignore
    selectionTimeoutRef.current = window.setTimeout(processSelection, SELECTION_RECALCULATE_DELAY_MS);
  }

  function processSelection() {
    if (!checkSelection()) {
      return;
    }

    if (isTextFormatterDisabled) {
      return;
    }

    const selectionRange = window.getSelection()!.getRangeAt(0);
    const selectionRect = selectionRange.getBoundingClientRect();
    const inputRect = inputRef.current!.getBoundingClientRect();

    let x = (selectionRect.left + selectionRect.width / 2) - inputRect.left;

    if (x < TEXT_FORMATTER_SAFE_AREA_PX) {
      x = TEXT_FORMATTER_SAFE_AREA_PX;
    } else if (x > inputRect.width - TEXT_FORMATTER_SAFE_AREA_PX) {
      x = inputRect.width - TEXT_FORMATTER_SAFE_AREA_PX;
    }

    setTextFormatterAnchorPosition({
      x,
      y: selectionRect.top - inputRect.top,
    });

    setSelectedRange(selectionRange);
    openTextFormatter();
  }

  function checkSelection() {
    // Disable the formatter on iOS devices for now.
    if (IS_IOS) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || isContextMenuOpenRef.current) {
      closeTextFormatter();
      if (IS_ANDROID) {
        setIsTextFormatterDisabled(false);
      }
      return false;
    }

    const selectionRange = selection.getRangeAt(0);
    const selectedText = selectionRange.toString().trim();
    if (
      shouldSuppressTextFormatter
      || !isSelectionInsideInput(selectionRange, editableInputId || EDITABLE_INPUT_ID)
      || !selectedText
      || parseEmojiOnlyString(selectedText)
      || !selectionRange.START_TO_END
    ) {
      closeTextFormatter();
      return false;
    }

    return true;
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.button !== 2) {
      e.target.addEventListener('mouseup', processSelectionWithTimeout, { once: true });
      return;
    }

    if (isContextMenuOpenRef.current) {
      return;
    }

    isContextMenuOpenRef.current = true;

    function handleCloseContextMenu(e2: KeyboardEvent | MouseEvent) {
      if (e2 instanceof KeyboardEvent && e2.key !== 'Esc' && e2.key !== 'Escape') {
        return;
      }

      setTimeout(() => {
        isContextMenuOpenRef.current = false;
      }, CONTEXT_MENU_CLOSE_DELAY_MS);

      window.removeEventListener('keydown', handleCloseContextMenu);
      window.removeEventListener('mousedown', handleCloseContextMenu);
    }

    document.addEventListener('mousedown', handleCloseContextMenu);
    document.addEventListener('keydown', handleCloseContextMenu);
  }

  useEffect(() => {
    const input = inputRef.current!;

    function suppressFocus() {
      input.blur();
    }

    if (shouldSuppressFocus) {
      input.addEventListener('focus', suppressFocus);
    }

    return () => {
      input.removeEventListener('focus', suppressFocus);
    };
  }, [shouldSuppressFocus]);

  return (
    <div
      ref={inputRef}
      id={EDITABLE_INPUT_ID}
      className={"scrollbars-hidden"}
      contentEditable
      role="textbox"
      dir="auto"
      tabIndex={0}
      onClick={focusInput}
      onChange={handleChange}
      onInput={handleChange}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { chatId, threadId }: OwnProps): StateProps => {
    // const { messageSendKeyCombo } = global.settings.byKey;
    const messageSendKeyCombo = undefined

    return {
      messageSendKeyCombo,
    };
  },
)(MessageInput));