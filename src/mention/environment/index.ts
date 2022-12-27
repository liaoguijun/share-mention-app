export function getPlatform() {
  const { userAgent, platform } = window.navigator;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os: 'macOS' | 'iOS' | 'Windows' | 'Android' | 'Linux' | undefined;

  if (iosPlatforms.indexOf(platform) !== -1
    // For new IPads with M1 chip and IPadOS platform returns "MacIntel"
    || (platform === 'MacIntel' && ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 2))) {
    os = 'iOS';
  } else if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'macOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (/Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}


export const IS_TOUCH_ENV = window.matchMedia('(pointer: coarse)').matches;
export const PLATFORM_ENV = getPlatform();
export const IS_MAC_OS = PLATFORM_ENV === 'macOS';
export const IS_IOS = PLATFORM_ENV === 'iOS';
export const IS_ANDROID = PLATFORM_ENV === 'Android';
export const IS_EMOJI_SUPPORTED = PLATFORM_ENV && (IS_MAC_OS || IS_IOS) && isLastEmojiVersionSupported();

function isLastEmojiVersionSupported() {
  const ALLOWABLE_CALCULATION_ERROR_SIZE = 5;
  const inlineEl = document.createElement('span');
  inlineEl.classList.add('emoji-test-element');
  document.body.appendChild(inlineEl);

  inlineEl.innerText = '🫱🏻'; // Emoji from 14.0 version
  const newEmojiWidth = inlineEl.offsetWidth;
  inlineEl.innerText = '❤️'; // Emoji from 1.0 version
  const legacyEmojiWidth = inlineEl.offsetWidth;

  document.body.removeChild(inlineEl);

  return Math.abs(newEmojiWidth - legacyEmojiWidth) < ALLOWABLE_CALCULATION_ERROR_SIZE;
}

export const MOBILE_SCREEN_MAX_WIDTH = 600; // px
export const MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH = 950; // px
export const MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT = 450; // px

export const IS_SINGLE_COLUMN_LAYOUT = window.innerWidth <= MOBILE_SCREEN_MAX_WIDTH || (
  window.innerWidth <= MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH && window.innerHeight <= MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT
);

const TEST_VIDEO = document.createElement('video');

export const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const IS_WEBM_SUPPORTED = Boolean(TEST_VIDEO.canPlayType('video/webm; codecs="vp9"').replace('no', ''))
  && !(IS_MAC_OS && IS_SAFARI); // Safari on MacOS has some issues with WebM

export const IS_OPUS_SUPPORTED = Boolean((new Audio()).canPlayType('audio/ogg; codecs=opus'));
export const IS_SERVICE_WORKER_SUPPORTED = 'serviceWorker' in navigator;
export const IS_PROGRESSIVE_SUPPORTED = IS_SERVICE_WORKER_SUPPORTED;


let isWebpSupportedCache: boolean | undefined;

export function isWebpSupported() {
  return Boolean(isWebpSupportedCache);
}


export const EDITABLE_INPUT_ID = 'editable-message-text';
export const EDITABLE_INPUT_CSS_SELECTOR = `#${EDITABLE_INPUT_ID}`;