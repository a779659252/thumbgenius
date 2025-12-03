import React, { useRef, useEffect, useState } from 'react';
import { TextLayer } from '../types';

interface DraggableTextProps {
  layer: TextLayer;
  isSelected: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onChange: (id: string, updates: Partial<TextLayer>) => void;
}

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const DraggableText: React.FC<DraggableTextProps> = ({
  layer,
  isSelected,
  scale,
  onSelect,
  onChange,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef<ResizeHandle | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const initialLayerState = useRef<Partial<TextLayer>>({});

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(layer.id);
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    initialLayerState.current = { x: layer.x, y: layer.y };
  };

  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    isResizing.current = handle;
    startPos.current = { x: e.clientX, y: e.clientY };
    initialLayerState.current = { 
        x: layer.x, 
        y: layer.y, 
        width: layer.width, 
        height: layer.height 
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current && !isResizing.current) return;

      const deltaX = (e.clientX - startPos.current.x) / scale;
      const deltaY = (e.clientY - startPos.current.y) / scale;

      if (isDragging.current) {
        onChange(layer.id, {
          x: (initialLayerState.current.x ?? 0) + deltaX,
          y: (initialLayerState.current.y ?? 0) + deltaY,
        });
      } else if (isResizing.current) {
        const handle = isResizing.current;
        let newWidth = initialLayerState.current.width ?? 0;
        let newHeight = initialLayerState.current.height ?? 0;
        let newX = initialLayerState.current.x ?? 0;
        let newY = initialLayerState.current.y ?? 0;

        if (handle.includes('right')) {
            newWidth += deltaX;
        } else if (handle.includes('left')) {
            newWidth -= deltaX;
            newX += deltaX;
        }

        if (handle.includes('bottom')) {
            newHeight += deltaY;
        } else if (handle.includes('top')) {
            newHeight -= deltaY;
            newY += deltaY;
        }
        
        onChange(layer.id, {
            width: Math.max(newWidth, 20), // Minimum size
            height: Math.max(newHeight, 20),
            x: newX,
            y: newY
        });
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      isResizing.current = null;
    };

    if (isSelected) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelected, scale, layer.id, onChange]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${layer.x}px`,
    top: `${layer.y}px`,
    width: `${layer.width}px`,
    height: `${layer.height}px`,
    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
    fontFamily: layer.fontFamily,
    fontSize: `${layer.fontSize}px`,
    fontWeight: layer.fontWeight as any,
    color: layer.color,
    textAlign: layer.textAlign,
    cursor: isDragging.current ? 'grabbing' : 'grab',
    whiteSpace: 'pre-wrap',
    zIndex: isSelected ? 50 : 10,
    userSelect: 'none',
    opacity: layer.opacity,
    WebkitTextStrokeWidth: `${layer.strokeWidth}px`,
    WebkitTextStrokeColor: layer.strokeColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  const shadow = `${layer.shadowOffsetX}px ${layer.shadowOffsetY}px ${layer.shadowBlur}px ${layer.shadowColor}`;
  style.textShadow = shadow;

  const bgOpacity = layer.backgroundOpacity ?? 1;

  const resizeHandles: ResizeHandle[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <div
      ref={elementRef}
      style={style}
      onMouseDown={handleMouseDown}
      className={`group hover:outline hover:outline-1 hover:outline-blue-400 ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
    >
      {layer.backgroundColor !== 'transparent' && (
        <div 
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                backgroundColor: layer.backgroundColor,
                opacity: bgOpacity,
                padding: `${layer.backgroundPadding}px`,
                zIndex: -1,
                borderRadius: '4px'
            }}
        />
      )}
      <span className="relative z-10">{layer.text}</span>
      
      {isSelected && (
        <>
            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            {/* Resize Handles */}
            {resizeHandles.map(handle => {
              const positionStyles: React.CSSProperties = {};
              if (handle.includes('top')) positionStyles.top = -5;
              if (handle.includes('bottom')) positionStyles.bottom = -5;
              if (handle.includes('left')) positionStyles.left = -5;
              if (handle.includes('right')) positionStyles.right = -5;
              
              let cursor = 'default';
              if (handle === 'top-left' || handle === 'bottom-right') cursor = 'nwse-resize';
              if (handle === 'top-right' || handle === 'bottom-left') cursor = 'nesw-resize';

              return (
                <div
                    key={handle}
                    style={{ ...positionStyles, cursor }}
                    className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full"
                    onMouseDown={(e) => handleResizeStart(e, handle)}
                />
              );
            })}
        </>
      )}
    </div>
  );
};

export default DraggableText;
