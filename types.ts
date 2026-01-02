
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "9:16",
  LANDSCAPE = "16:9",
  THREE_FOUR = "3:4",
  FOUR_THREE = "4:3"
}

export interface ThumbnailPreset {
  id: string;
  name: string;
  prompt: string;
  description: string;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
}

export type EditorTab = 'generate' | 'ai-edit' | 'adjust' | 'crop';

export interface User {
  email: string;
  name: string;
  tokens: number;
  lastResetMonth: number;
}

export type AuthMode = 'signin' | 'signup';

export const TOKEN_COST_PER_GEN = 5;
export const FREE_MONTHLY_TOKENS = 200;
export const PURCHASE_TOKEN_AMOUNT = 100;
export const PURCHASE_PRICE_INR = 10;
