import React from 'react';
import { TextLayer, FontOption } from '../types';
import { AVAILABLE_FONTS } from '../constants';
import { Trash2, Type, Layers } from 'lucide-react';

interface SidebarProps {
  selectedLayer: TextLayer | null;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onAddLayer: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onAddLayer,
}) => {
  if (!selectedLayer) {
    return (
      <div className="w-80 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-6 text-gray-400 overflow-y-auto h-full">
        <div className="text-center mt-10">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">No Layer Selected</p>
          <p className="text-sm mt-2">Select a text layer on the canvas to edit its properties, or add a new one.</p>
        </div>
        <button
          onClick={onAddLayer}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Type size={18} />
          Add Text Layer
        </button>
      </div>
    );
  }

  const handleChange = (key: keyof TextLayer, value: any) => {
    onUpdateLayer(selectedLayer.id, { [key]: value });
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Type size={16} className="text-blue-500" />
          Edit Text
        </h2>
        <button
          onClick={() => onDeleteLayer(selectedLayer.id)}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
          title="Delete Layer"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Content Section */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</label>
          <textarea
            value={selectedLayer.text}
            onChange={(e) => handleChange('text', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y min-h-[80px]"
            placeholder="Enter text here..."
          />
        </section>

        {/* Typography Section */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Typography</label>
          
          <div className="grid grid-cols-2 gap-2">
             <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Font Family</label>
                <select
                  value={selectedLayer.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-white focus:outline-none"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.name} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
             </div>
             
             <div>
               <label className="text-xs text-gray-400 mb-1 block">Size</label>
               <input
                type="number"
                value={selectedLayer.fontSize}
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-white"
               />
             </div>
             
             <div>
               <label className="text-xs text-gray-400 mb-1 block">Weight</label>
               <select
                 value={selectedLayer.fontWeight}
                 onChange={(e) => handleChange('fontWeight', e.target.value)}
                 className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-white"
               >
                 <option value="400">Regular</option>
                 <option value="600">Semi Bold</option>
                 <option value="700">Bold</option>
                 <option value="900">Black</option>
               </select>
             </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Alignment</label>
            <div className="flex bg-gray-800 rounded-md p-1 border border-gray-700">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => handleChange('textAlign', align)}
                  className={`flex-1 py-1 rounded text-xs capitalize ${
                    selectedLayer.textAlign === align ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Color & Appearance */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Appearance</label>
          
          <div className="flex items-center justify-between">
             <label className="text-sm text-gray-300">Text Color</label>
             <div className="flex items-center gap-2">
               <input 
                 type="color" 
                 value={selectedLayer.color} 
                 onChange={(e) => handleChange('color', e.target.value)}
                 className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" 
               />
               <span className="text-xs text-gray-500 font-mono">{selectedLayer.color}</span>
             </div>
          </div>
          
          <div className="flex items-center justify-between">
             <label className="text-sm text-gray-300">Opacity (Layer)</label>
             <input
               type="range"
               min="0"
               max="1"
               step="0.05"
               value={selectedLayer.opacity}
               onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
               className="w-24 accent-blue-500"
             />
          </div>

          <div className="pt-2 border-t border-gray-800">
             <label className="text-xs text-gray-400 mb-2 block">Background</label>
             <div className="flex items-center gap-2 mb-2">
                 <input 
                   type="checkbox"
                   checked={selectedLayer.backgroundColor !== 'transparent'}
                   onChange={(e) => handleChange('backgroundColor', e.target.checked ? '#000000' : 'transparent')}
                   className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500"
                 />
                 <span className="text-sm text-gray-300">Enable Background</span>
             </div>
             
             {selectedLayer.backgroundColor !== 'transparent' && (
                <div className="space-y-2 pl-6">
                   <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-400">Color</span>
                     <input 
                       type="color" 
                       value={selectedLayer.backgroundColor} 
                       onChange={(e) => handleChange('backgroundColor', e.target.value)}
                       className="w-6 h-6 rounded cursor-pointer border-none bg-transparent" 
                     />
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-400">BG Opacity</span>
                     <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={selectedLayer.backgroundOpacity ?? 1}
                        onChange={(e) => handleChange('backgroundOpacity', parseFloat(e.target.value))}
                        className="w-24 accent-blue-500"
                    />
                   </div>

                   <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-400">Padding</span>
                     <input 
                       type="number" 
                       value={selectedLayer.backgroundPadding} 
                       onChange={(e) => handleChange('backgroundPadding', Number(e.target.value))}
                       className="w-16 bg-gray-800 border border-gray-700 rounded p-1 text-xs text-white" 
                     />
                   </div>
                </div>
             )}
          </div>
        </section>

        {/* Effects (Shadow/Stroke) */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Effects</label>
          
          {/* Stroke */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-300">Stroke</label>
              <input 
                type="color" 
                value={selectedLayer.strokeColor === 'transparent' ? '#000000' : selectedLayer.strokeColor}
                onChange={(e) => handleChange('strokeColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
               <span className="text-xs text-gray-500 w-8">Width</span>
               <input 
                 type="range" 
                 min="0" max="20" 
                 value={selectedLayer.strokeWidth}
                 onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
                 className="flex-1 accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none"
               />
               <span className="text-xs text-gray-400 w-4">{selectedLayer.strokeWidth}</span>
            </div>
          </div>

          {/* Shadow */}
          <div className="pt-2 border-t border-gray-800 space-y-2">
             <div className="flex justify-between items-center">
                <label className="text-sm text-gray-300">Shadow</label>
                <input 
                  type="color" 
                  value={selectedLayer.shadowColor}
                  onChange={(e) => handleChange('shadowColor', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                />
             </div>
             
             <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2 flex items-center gap-2">
                   <span className="text-xs text-gray-500 w-8">Blur</span>
                   <input 
                     type="range" min="0" max="50" 
                     value={selectedLayer.shadowBlur}
                     onChange={(e) => handleChange('shadowBlur', Number(e.target.value))}
                     className="flex-1 accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none"
                   />
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500 w-4">X</span>
                   <input 
                     type="number" value={selectedLayer.shadowOffsetX}
                     onChange={(e) => handleChange('shadowOffsetX', Number(e.target.value))}
                     className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs text-white"
                   />
                </div>
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500 w-4">Y</span>
                   <input 
                     type="number" value={selectedLayer.shadowOffsetY}
                     onChange={(e) => handleChange('shadowOffsetY', Number(e.target.value))}
                     className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs text-white"
                   />
                </div>
             </div>
          </div>
        </section>

        {/* Transform */}
         <section className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transform</label>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="text-xs text-gray-400 mb-1 block">Width</label>
                <input
                type="number"
                value={selectedLayer.width}
                onChange={(e) => handleChange('width', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-white"
                />
            </div>
            <div>
                <label className="text-xs text-gray-400 mb-1 block">Height</label>
                <input
                type="number"
                value={selectedLayer.height}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-white"
                />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
             <span className="text-xs text-gray-500 w-12">Rotate</span>
             <input 
               type="range" min="-180" max="180" 
               value={selectedLayer.rotation}
               onChange={(e) => handleChange('rotation', Number(e.target.value))}
               className="flex-1 accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none"
             />
             <span className="text-xs text-gray-400 w-8 text-right">{selectedLayer.rotation}°</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Sidebar;