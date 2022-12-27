import { throttle } from './schedulers';
import { getGlobal } from '../global';
import { IS_WEBM_SUPPORTED } from '../environment'

import placeholderSrc from '../assets/square.svg';
import blankSrc from '../assets/blank.png';
import generateIdFor from './generateIdFor'
import * as mediaLoader from './mediaLoader';
import { ApiMediaFormat } from '../types'
import { getStickerPreviewHash } from '../helper/symbols'

type CustomEmojiInputRenderCallback = (emojiId: string) => void;

const INPUT_WAITING_CUSTOM_EMOJI_IDS: Set<string> = new Set();
const ID_STORE = {};
const DOM_PROCESS_THROTTLE = 500;
const renderHandlers = new Set<CustomEmojiInputRenderCallback>();

function processDomForCustomEmoji() {
  const emojis = document.querySelectorAll<HTMLImageElement>('.custom-emoji.placeholder');
  emojis.forEach((emoji) => {
    const customEmoji = getGlobal().customEmojis.byId[emoji.dataset.documentId!];
    if (!customEmoji) {
      INPUT_WAITING_CUSTOM_EMOJI_IDS.add(emoji.dataset.documentId!);
      return;
    }
    const [isPlaceholder, src, uniqueId] = getInputCustomEmojiParams(customEmoji);

    if (!isPlaceholder) {
        // @ts-ignore
      emoji.src = src;
      emoji.classList.remove('placeholder');
        // @ts-ignore
      if (uniqueId) emoji.dataset.uniqueId = uniqueId;

      callInputRenderHandlers(customEmoji.id);
    }
  });
}

export function getInputCustomEmojiParams(customEmoji?: any) {
  if (!customEmoji) return [true, placeholderSrc, undefined];
  const shouldUseStaticFallback = !IS_WEBM_SUPPORTED && customEmoji.isVideo;
  const isUsingSharedCanvas = customEmoji.isLottie || (customEmoji.isVideo && !shouldUseStaticFallback);
  if (isUsingSharedCanvas) {
    fetchAndProcess(`sticker${customEmoji.id}`);
    return [false, blankSrc, generateIdFor(ID_STORE, true)];
  }

  const mediaData = getCustomEmojiMediaDataForInput(customEmoji.id, shouldUseStaticFallback);

  return [!mediaData, mediaData || placeholderSrc, undefined];
}

const callInputRenderHandlers = throttle((emojiId: string) => {
  renderHandlers.forEach((handler) => handler(emojiId));
}, DOM_PROCESS_THROTTLE);

function fetchAndProcess(mediaHash: string) {
  return mediaLoader.fetch(mediaHash, ApiMediaFormat.BlobUrl).then(() => {
    processMessageInputForCustomEmoji();
  });
}

export function getCustomEmojiMediaDataForInput(emojiId: string, isPreview?: boolean) {
  const mediaHash = isPreview ? getStickerPreviewHash(emojiId) : `sticker${emojiId}`;
  const data = mediaLoader.getFromMemory(mediaHash);
  if (data) {
    return data;
  }

  fetchAndProcess(mediaHash);
  return undefined;
}

export const processMessageInputForCustomEmoji = throttle(processDomForCustomEmoji, DOM_PROCESS_THROTTLE);