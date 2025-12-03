import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Download, Image as ImageIcon, Plus, LayoutTemplate, Smartphone, Monitor, Save, Trash2 } from 'lucide-react';
import { TextLayer, ProjectState } from './types';
import { DEFAULT_LAYER, TEMPLATES } from './constants';
import DraggableText from './components/DraggableText';
import Sidebar from './components/Sidebar';
import { downloadImage } from './utils/canvasHelper';

interface SavedTemplate {
  layers: TextLayer[];
  aspectRatio: '16:9' | '9:16';
}

const App: React.FC = () => {
  // State
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const [customTemplates, setCustomTemplates] = useState<Record<string, SavedTemplate>>({});
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived dimensions
  const canvasWidth = aspectRatio === '16:9' ? 1280 : 720;
  const canvasHeight = aspectRatio === '16:9' ? 720 : 1280;

  // Load project from local storage on mount
  useEffect(() => {
    const savedProject = localStorage.getItem('thumbgenius-project');
    if (savedProject) {
      try {
        const parsed: ProjectState = JSON.parse(savedProject);
        if (parsed.layers) setLayers(parsed.layers);
        if (parsed.backgroundImage) setBackgroundImage(parsed.backgroundImage);
        if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
      } catch (e) {
        console.error("Failed to load saved project", e);
      }
    } else {
        // Initial defaults if nothing saved
        setLayers([{ ...DEFAULT_LAYER, id: uuidv4() }]);
    }

    // Load custom templates
    const savedTemplates = localStorage.getItem('thumbgenius-custom-templates');
    if (savedTemplates) {
        try {
            setCustomTemplates(JSON.parse(savedTemplates));
        } catch (e) {
            console.error("Failed to load custom templates", e);
        }
    }
  }, []);

  // Auto-save project state
  useEffect(() => {
    const state: ProjectState = {
      backgroundImage,
      layers,
      canvasWidth,
      canvasHeight,
      aspectRatio
    };
    localStorage.setItem('thumbgenius-project', JSON.stringify(state));
  }, [backgroundImage, layers, aspectRatio, canvasWidth, canvasHeight]);

  // Adjust canvas scale for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const containerWidth = canvasRef.current.offsetWidth;
        const containerHeight = canvasRef.current.offsetHeight;
        
        const targetRatio = canvasWidth / canvasHeight;
        const containerRatio = containerWidth / containerHeight;

        let scale;
        if (containerRatio > targetRatio) {
          scale = (containerHeight - 80) / canvasHeight; // 80px padding for vertical breathing room
        } else {
          scale = (containerWidth - 80) / canvasWidth;
        }
        setCanvasScale(Math.min(scale, 1)); 
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasWidth, canvasHeight]);

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setBackgroundImage(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLayer = () => {
    const newLayer: TextLayer = {
      ...DEFAULT_LAYER,
      id: uuidv4(),
      x: canvasWidth / 2,
      y: canvasHeight / 2,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleCanvasClick = () => {
    setSelectedLayerId(null);
  };

  const handleDownload = () => {
    downloadImage(backgroundImage, layers, canvasWidth, canvasHeight);
  };

  // Template Management
  const loadPreset = (templateName: string) => {
    if (confirm("This will replace current text layers. Continue?")) {
      const templateLayers = TEMPLATES[templateName];
      const newLayers = templateLayers.map(l => ({
        ...DEFAULT_LAYER,
        ...l,
        id: uuidv4(),
        x: canvasWidth / 2, // Reset positions to center for safety on varied aspect ratios
        y: canvasHeight / 2
      } as TextLayer));
      setLayers(newLayers);
      setSelectedLayerId(null);
    }
  };

  const loadCustomTemplate = (name: string) => {
    if (confirm(`Load template "${name}"? This will replace your current design.`)) {
        const tpl = customTemplates[name];
        // Handle potential legacy format or new object format
        const tplLayers = Array.isArray(tpl) ? tpl : tpl.layers;
        const tplRatio = Array.isArray(tpl) ? '16:9' : tpl.aspectRatio;

        setLayers(tplLayers.map(l => ({...l, id: uuidv4()})));
        if (tplRatio) setAspectRatio(tplRatio);
        setSelectedLayerId(null);
    }
  };

  const handleSaveTemplate = () => {
      const name = prompt("Enter a name for this template:");
      if (!name || !name.trim()) return;
      
      const newTemplates = {
          ...customTemplates,
          [name.trim()]: {
              layers: layers.map(l => ({...l, id: uuidv4()})), // Clone with new IDs
              aspectRatio
          }
      };
      
      setCustomTemplates(newTemplates);
      localStorage.setItem('thumbgenius-custom-templates', JSON.stringify(newTemplates));
  };

  const handleDeleteTemplate = (name: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete template "${name}"?`)) {
          const newTemplates = { ...customTemplates };
          delete newTemplates[name];
          setCustomTemplates(newTemplates);
          localStorage.setItem('thumbgenius-custom-templates', JSON.stringify(newTemplates));
      }
  };

  const toggleAspectRatio = () => {
      setAspectRatio(prev => prev === '16:9' ? '9:16' : '16:9');
  }

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans">
      {/* Sidebar (Left) */}
      <Sidebar 
        selectedLayer={selectedLayer}
        onUpdateLayer={updateLayer}
        onDeleteLayer={deleteLayer}
        onAddLayer={addLayer}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              ThumbGenius
            </h1>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            
            {/* Aspect Ratio Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button 
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-2 rounded flex items-center gap-2 text-xs font-medium transition-all ${aspectRatio === '16:9' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    title="Landscape (YouTube)"
                >
                    <Monitor size={16} />
                    16:9
                </button>
                <button 
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-2 rounded flex items-center gap-2 text-xs font-medium transition-all ${aspectRatio === '9:16' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    title="Portrait (Shorts/TikTok)"
                >
                    <Smartphone size={16} />
                    9:16
                </button>
            </div>

            {/* Template Dropdown */}
            <div className="relative group">
               <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                  <LayoutTemplate size={16} />
                  <span>Templates</span>
               </button>
               
               {/* Enhanced Dropdown Menu */}
               <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 hidden group-hover:block z-50">
                   {/* Custom Templates Section */}
                   <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">My Templates</span>
                       <button 
                         onClick={handleSaveTemplate} 
                         className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                         title="Save current layout as template"
                       >
                           <Save size={12} /> Save
                       </button>
                   </div>
                   
                   <div className="max-h-48 overflow-y-auto custom-scrollbar">
                       {Object.keys(customTemplates).length === 0 ? (
                           <div className="px-4 py-3 text-xs text-gray-500 italic text-center">No saved templates yet.<br/>Design one and click Save!</div>
                       ) : (
                           Object.keys(customTemplates).map(name => (
                               <div key={name} className="flex items-center justify-between px-4 py-2 hover:bg-gray-700 group/item cursor-pointer transition-colors" onClick={() => loadCustomTemplate(name)}>
                                   <div className="flex items-center gap-2 overflow-hidden">
                                     <span className="text-xs font-mono text-gray-500 bg-gray-900 px-1 rounded">
                                       {customTemplates[name].aspectRatio || '16:9'}
                                     </span>
                                     <span className="text-sm text-gray-300 group-hover/item:text-white truncate">{name}</span>
                                   </div>
                                   <button 
                                       onClick={(e) => handleDeleteTemplate(name, e)}
                                       className="text-gray-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity p-1"
                                       title="Delete template"
                                   >
                                       <Trash2 size={14} />
                                   </button>
                               </div>
                           ))
                       )}
                   </div>

                   {/* Presets Section */}
                   <div className="px-4 py-2 border-b border-gray-700 border-t mt-1 bg-gray-800/50">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Presets</span>
                   </div>
                   {Object.keys(TEMPLATES).map(t => (
                       <button 
                        key={t}
                        onClick={() => loadPreset(t)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white capitalize transition-colors"
                       >
                           {t}
                       </button>
                   ))}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
             >
               <ImageIcon size={16} />
               Change BG
             </button>
             <input 
               ref={fileInputRef}
               type="file" 
               accept="image/*" 
               className="hidden" 
               onChange={handleImageUpload}
             />
             
             <button 
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
             >
               <Download size={16} />
               Export
             </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div 
            className="flex-1 bg-gray-950 flex items-center justify-center p-8 overflow-hidden relative"
            onMouseDown={handleCanvasClick}
            ref={canvasRef}
        >
             {/* Grid Pattern Background */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{
                      backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                  }}
             ></div>

             {/* The "Stage" */}
             <div 
               style={{
                   width: `${canvasWidth}px`,
                   height: `${canvasHeight}px`,
                   transform: `scale(${canvasScale})`,
                   boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)'
               }}
               className="relative bg-gray-800 shadow-2xl overflow-hidden transition-all duration-300 ease-out select-none group"
             >
                {/* Background Image */}
                {backgroundImage ? (
                    <img 
                      src={backgroundImage} 
                      alt="Thumbnail Background" 
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 pointer-events-none">
                        <div className="text-center">
                            <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-xl font-semibold">Upload an image to start</p>
                        </div>
                    </div>
                )}

                {/* Layers */}
                {layers.map(layer => (
                    <DraggableText 
                        key={layer.id}
                        layer={layer}
                        isSelected={layer.id === selectedLayerId}
                        scale={canvasScale}
                        onSelect={setSelectedLayerId}
                        onChange={updateLayer}
                    />
                ))}
             </div>
             
             {/* Canvas Footer Info */}
             <div className="absolute bottom-4 left-6 text-gray-600 text-xs font-mono">
                Canvas: {canvasWidth}x{canvasHeight} • Scale: {(canvasScale * 100).toFixed(0)}%
             </div>
        </div>
      </div>

      {/* Floating Action Button (Add Text) */}
      <button
        onClick={addLayer}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 z-50"
        title="Add Text Layer"
      >
          <Plus size={28} />
      </button>
    </div>
  );
};

export default App;