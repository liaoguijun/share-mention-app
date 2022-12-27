

export type ThemeKey = 'light' | 'dark';
export type AnimationLevel = 0 | 1 | 2;

export type NotifySettings = {
  hasPrivateChatsNotifications?: boolean;
  hasPrivateChatsMessagePreview?: boolean;
  hasGroupNotifications?: boolean;
  hasGroupMessagePreview?: boolean;
  hasBroadcastNotifications?: boolean;
  hasBroadcastMessagePreview?: boolean;
  hasContactJoinedNotifications?: boolean;
  hasWebNotifications: boolean;
  hasPushNotifications: boolean;
  notificationSoundVolume: number;
};

export interface ISettings extends NotifySettings, Record<string, any> {
  theme: ThemeKey;
  shouldUseSystemTheme: boolean;
  messageTextSize: number;
  animationLevel: AnimationLevel;
  messageSendKeyCombo: 'enter' | 'ctrl-enter';
  canAutoLoadPhotoFromContacts: boolean;
  canAutoLoadPhotoInPrivateChats: boolean;
  canAutoLoadPhotoInGroups: boolean;
  canAutoLoadPhotoInChannels: boolean;
  canAutoLoadVideoFromContacts: boolean;
  canAutoLoadVideoInPrivateChats: boolean;
  canAutoLoadVideoInGroups: boolean;
  canAutoLoadVideoInChannels: boolean;
  canAutoLoadFileFromContacts: boolean;
  canAutoLoadFileInPrivateChats: boolean;
  canAutoLoadFileInGroups: boolean;
  canAutoLoadFileInChannels: boolean;
  autoLoadFileMaxSizeMb: number;
  canAutoPlayGifs: boolean;
  canAutoPlayVideos: boolean;
  shouldSuggestStickers: boolean;
  shouldSuggestCustomEmoji: boolean;
  shouldLoopStickers: boolean;
  hasPassword?: boolean;
  languages?: ApiLanguage[];
  language: LangCode;
  isSensitiveEnabled?: boolean;
  canChangeSensitive?: boolean;
  timeFormat: TimeFormat;
  wasTimeFormatSetManually: boolean;
  isConnectionStatusMinimized: boolean;
  shouldArchiveAndMuteNewNonContact?: boolean;
}

export interface ApiLanguage {
  official?: true;
  rtl?: true;
  beta?: true;
  name: string;
  nativeName: string;
  langCode: string;
  baseLangCode?: string;
  pluralCode: string;
  stringsCount: number;
  translatedCount: number;
  translationsUrl: string;
}

export type LangCode = (
  'en' | 'ar' | 'be' | 'ca' | 'nl' | 'fr' | 'de' | 'id' | 'it' | 'ko' | 'ms' | 'fa' | 'pl' | 'pt-br' | 'ru' | 'es'
  | 'tr' | 'uk' | 'uz'
);

export type TimeFormat = '24h' | '12h';

export type GlobalState = any;

export type ActionPayloads = any;

export type NonTypedActionNames = any;

export type IAnchorPosition = {
  x: number;
  y: number;
};
export interface ApiSticker {}

export interface ApiOnProgress {
  (
    progress: number, // Float between 0 and 1.
    ...args: any[]
  ): void;

  isCanceled?: boolean;
  acceptsBuffer?: boolean;
}

export type ApiParsedMedia = string | Blob | ArrayBuffer;

export type ApiPreparedMedia = string;

export enum ApiMediaFormat {
  BlobUrl,
  Progressive,
  Stream,
  DownloadUrl,
  Text,

}

export type ApiChatMember = any;

export type ApiUser = any;

export type ApiChat = any;

export type ApiUserStatus = any;

export enum ApiMessageEntityTypes {
  Bold = 'MessageEntityBold',
  Blockquote = 'MessageEntityBlockquote',
  BotCommand = 'MessageEntityBotCommand',
  Cashtag = 'MessageEntityCashtag',
  Code = 'MessageEntityCode',
  Email = 'MessageEntityEmail',
  Hashtag = 'MessageEntityHashtag',
  Italic = 'MessageEntityItalic',
  MentionName = 'MessageEntityMentionName',
  Mention = 'MessageEntityMention',
  Phone = 'MessageEntityPhone',
  Pre = 'MessageEntityPre',
  Strike = 'MessageEntityStrike',
  TextUrl = 'MessageEntityTextUrl',
  Url = 'MessageEntityUrl',
  Underline = 'MessageEntityUnderline',
  Spoiler = 'MessageEntitySpoiler',
  CustomEmoji = 'MessageEntityCustomEmoji',
  Unknown = 'MessageEntityUnknown',
}

export interface ApiCountry {
  isHidden?: boolean;
  iso2: string;
  defaultName: string;
  name?: string;
}

export interface ApiCountryCode extends ApiCountry {
  countryCode: string;
  prefixes?: string[];
  patterns?: string[];
}

export interface AnyLiteral {
  [key: string]: any;
}

export enum FocusDirection {
  Up,
  Down,
  Static,
}
