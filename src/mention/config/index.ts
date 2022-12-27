export const EDITABLE_INPUT_ID = 'editable-message-text';
export const DEBUG = process.env.APP_ENV !== 'production';
export const MEDIA_CACHE_DISABLED = false;
export const MEDIA_CACHE_NAME = 'tt-media';
export const MEDIA_CACHE_NAME_AVATARS = 'tt-media-avatars';
export const SERVICE_NOTIFICATIONS_USER_ID = '777000';

export const SUPPORTED_IMAGE_CONTENT_TYPES = new Set([
  'image/png', 'image/gif', 'image/jpeg',
]);

export const SUPPORTED_VIDEO_CONTENT_TYPES = new Set([
  'video/mp4', // video/quicktime added dynamically in environment.ts
]);


export const CONTENT_TYPES_WITH_PREVIEW = new Set([
    // @ts-ignore
  ...SUPPORTED_IMAGE_CONTENT_TYPES,
    // @ts-ignore
  ...SUPPORTED_VIDEO_CONTENT_TYPES,
]);

export const DEBUG_MORE = false;
export const DEBUG_ALERT_MSG = 'Shoot!\nSomething went wrong, please see the error details in Dev Tools Console.';

export const ANIMATION_LEVEL_MIN = 0;

export const FAST_SMOOTH_MAX_DISTANCE = 1500;
export const FAST_SMOOTH_MIN_DURATION = 250;
export const FAST_SMOOTH_MAX_DURATION = 600;
export const FAST_SMOOTH_SHORT_TRANSITION_MAX_DISTANCE = 500; // px