export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  strokeColor: string;
  strokeWidth: number;
  rotation: number;
  backgroundColor: string; // "transparent" or hex
  backgroundOpacity: number; // 0 to 1
  backgroundPadding: number;
  opacity: number;
}

export interface ProjectState {
  backgroundImage: string | null; // Data URL
  layers: TextLayer[];
  canvasWidth: number;
  canvasHeight: number;
  aspectRatio: '16:9' | '9:16';
}

export type FontOption = {
  name: string;
  value: string;
};

export type PresetTemplate = {
  name: string;
  description: string;
  layers: TextLayer[];
};