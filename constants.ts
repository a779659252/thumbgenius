import { FontOption, TextLayer } from './types';

export const AVAILABLE_FONTS: FontOption[] = [
  { name: 'Inter', value: '"Inter", sans-serif' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif' },
  { name: 'Oswald', value: '"Oswald", sans-serif' },
  { name: 'Poppins', value: '"Poppins", sans-serif' },
  { name: 'Roboto Slab', value: '"Roboto Slab", serif' },
  { name: 'Anton', value: '"Anton", sans-serif' },
  { name: 'Bangers', value: '"Bangers", system-ui' },
  { name: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
  { name: 'Permanent Marker', value: '"Permanent Marker", cursive' },
  { name: 'Lobster', value: '"Lobster", cursive' },
  { name: 'Righteous', value: '"Righteous", cursive' },
  { name: 'System', value: 'system-ui, -apple-system, sans-serif' },
];

export const DEFAULT_LAYER: TextLayer = {
  id: '',
  text: 'NEW TEXT',
  x: 100,
  y: 100,
  width: 300,
  height: 150,
  fontSize: 64,
  fontFamily: '"Montserrat", sans-serif',
  color: '#ffffff',
  fontWeight: '900',
  textAlign: 'center',
  shadowColor: '#000000',
  shadowBlur: 10,
  shadowOffsetX: 4,
  shadowOffsetY: 4,
  strokeColor: 'transparent',
  strokeWidth: 0,
  rotation: 0,
  backgroundColor: 'transparent',
  backgroundOpacity: 1,
  backgroundPadding: 10,
  opacity: 1,
};

export const TEMPLATES: Record<string, Partial<TextLayer>[]> = {
  'minimal': [
    {
      text: 'EPIC VLOG',
      x: 640, y: 360, fontSize: 120, fontFamily: '"Oswald", sans-serif', color: '#ffffff',
      shadowBlur: 0, shadowOffsetX: 5, shadowOffsetY: 5, shadowColor: '#000000'
    }
  ],
  'gaming': [
    {
      text: 'GAMEPLAY',
      x: 640, y: 150, fontSize: 80, fontFamily: '"Poppins", sans-serif', color: '#FCD34D',
      strokeColor: '#000000', strokeWidth: 4, shadowColor: '#000000', shadowBlur: 20
    },
    {
      text: 'FULL REVIEW',
      x: 640, y: 550, fontSize: 100, fontFamily: '"Montserrat", sans-serif', color: '#ffffff',
      backgroundColor: '#DC2626', backgroundPadding: 20, backgroundOpacity: 1
    }
  ]
};