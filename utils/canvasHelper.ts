import { TextLayer } from '../types';

export const drawCanvas = async (
  canvas: HTMLCanvasElement,
  backgroundImage: string | null,
  layers: TextLayer[],
  width: number = 1280,
  height: number = 720
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw Background
  if (backgroundImage) {
    const img = new Image();
    img.src = backgroundImage;
    await new Promise<void>((resolve) => {
      img.onload = () => {
        // Cover fit
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width / 2) - (img.width / 2) * scale;
        const y = (height / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        resolve();
      };
      img.onerror = () => resolve(); // Proceed even if bg fails
    });
  } else {
    // Default background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Layers
  layers.forEach((layer) => {
    ctx.save();
    
    // Positioning
    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    
    // Main Layer Opacity (applies to everything)
    ctx.globalAlpha = layer.opacity;

    ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily.replace(/"/g, '')}`;
    ctx.textAlign = layer.textAlign;
    ctx.textBaseline = 'middle';

    const lines = layer.text.split('\n');
    const lineHeight = layer.fontSize * 1.2;
    
    // Calculate bounding box for background
    if (layer.backgroundColor !== 'transparent') {
      let maxWidth = 0;
      lines.forEach(line => {
        const metrics = ctx.measureText(line);
        if (metrics.width > maxWidth) maxWidth = metrics.width;
      });
      
      const totalHeight = lines.length * lineHeight;
      const bgX = -maxWidth / 2 - layer.backgroundPadding; 
      const bgY = -lineHeight / 2 - layer.backgroundPadding; 
      
      // Adjust X based on alignment
      let drawXOffset = 0;
      if (layer.textAlign === 'left') drawXOffset = 0;
      if (layer.textAlign === 'center') drawXOffset = -maxWidth / 2;
      if (layer.textAlign === 'right') drawXOffset = -maxWidth;

      ctx.save();
      // Apply background-specific opacity combined with layer opacity
      // Since globalAlpha is already set to layer.opacity, we multiply or just set it locally.
      // Actually, drawing rect is inside the main save(), so current alpha is layer.opacity.
      // We want effective alpha = layer.opacity * layer.backgroundOpacity.
      ctx.globalAlpha = layer.opacity * (layer.backgroundOpacity ?? 1);
      
      ctx.fillStyle = layer.backgroundColor;
      ctx.fillRect(
        drawXOffset - layer.backgroundPadding, 
        -(lineHeight * 0.5) - layer.backgroundPadding, 
        maxWidth + (layer.backgroundPadding * 2), 
        totalHeight + (layer.backgroundPadding * 2) - (lineHeight - layer.fontSize) 
      );
      ctx.restore();
    }

    // Shadow
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur;
    ctx.shadowOffsetX = layer.shadowOffsetX;
    ctx.shadowOffsetY = layer.shadowOffsetY;

    // Draw Text
    lines.forEach((line, index) => {
      const yOffset = index * lineHeight;
      
      // Stroke
      if (layer.strokeWidth > 0 && layer.strokeColor !== 'transparent') {
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = layer.strokeWidth;
        ctx.strokeText(line, 0, yOffset);
      }

      // Fill
      ctx.fillStyle = layer.color;
      ctx.fillText(line, 0, yOffset);
    });

    ctx.restore();
  });
};

export const downloadImage = async (
  backgroundImage: string | null,
  layers: TextLayer[],
  width: number,
  height: number,
  fileName: string = 'thumbnail.png'
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  await drawCanvas(canvas, backgroundImage, layers, width, height);
  
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
};