export interface ApiAttachment {
  blobUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  quick?: {
    width: number;
    height: number;
    duration?: number;
  };
  voice?: {
    duration: number;
    waveform: number[];
  };
  audio?: {
    duration: number;
    title?: string;
    performer?: string;
  };
  previewBlobUrl?: string;
}