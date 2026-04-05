import React, { useState, useEffect, useRef } from 'react';
import { DayMeaning, Category, AVAILABLE_COLORS } from '../types';
import { generateDailyMeaning } from '../services/geminiService';
import { X, Sparkles, Save, Trash2, Plus, Image as ImageIcon, ArrowLeft, Edit2 } from 'lucide-react';
import { MONTH_NAMES } from '../utils/dateUtils';

interface DayModalProps {
  dateKey: string; // MM-DD
  dayEvents: DayMeaning[];
  categories: Category[];
  onClose: () => void;
  onSave: (meaning: DayMeaning) => void;
  onDelete: (id: string) => void;
  onAddCategory: (category: Category) => void;
}

const DayModal: React.FC<DayModalProps> = ({ 
  dateKey, 
  dayEvents, 
  categories, 
  onClose, 
  onSave, 
  onDelete,
  onAddCategory 
}) => {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(AVAILABLE_COLORS[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize logic: if no events, go straight to form
  useEffect(() => {
    if (dayEvents.length === 0) {
      setMode('form');
      resetForm();
    } else {
      setMode('list');
    }
  }, [dateKey]);

  const resetForm = () => {
    setEditingId(null);
    setYear(new Date().getFullYear());
    setTitle('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setImageUrl(undefined);
  };

  const startEdit = (event: DayMeaning) => {
    setEditingId(event.id);
    setYear(event.year);
    setTitle(event.title);
    setDescription(event.description);
    setCategoryId(event.categoryId);
    setImageUrl(event.imageUrl);
    setMode('form');
  };

  const startCreate = () => {
    resetForm();
    setMode('form');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const categoryName = categories.find(c => c.id === categoryId)?.name;
      const [month, day] = dateKey.split('-');
      const fullDate = `${year}-${month}-${day}`;
      
      const generatedText = await generateDailyMeaning(fullDate, description, categoryName, year);
      setDescription(prev => prev ? `${prev}\n\n✨ AI Insight: ${generatedText}` : generatedText);
      if (!title) setTitle("A Day to Remember");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() && !description.trim() && !imageUrl) return;
    
    onSave({
      id: editingId || crypto.randomUUID(),
      date: dateKey,
      year: year,
      title: title || 'Untitled Day',
      description,
      categoryId: categoryId || categories[0]?.id,
      imageUrl,
      generated: false
    });
    
    setMode('list');
  };

  const handleDeleteCurrent = () => {
    if (editingId) {
        onDelete(editingId);
        setMode('list');
    }
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat_${crypto.randomUUID()}`,
      name: newCatName,
      color: newCatColor
    };
    onAddCategory(newCat);
    setCategoryId(newCat.id);
    setIsAddingCategory(false);
    setNewCatName('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImageUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || 'bg-slate-400';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Uncategorized';

  const [m, d] = dateKey.split('-').map(Number);
  const monthName = MONTH_NAMES[m - 1];
  const humanReadableDate = `${monthName} ${d}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-xl">{humanReadableDate}</h3>
            <span className="text-slate-400 text-sm">
                {mode === 'list' ? 'Memories' : (editingId ? 'Edit Memory' : 'New Memory')}
            </span>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {mode === 'list' ? (
            // --- LIST VIEW ---
            <div className="flex flex-col h-[60vh] max-h-[600px]">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <button 
                        onClick={startCreate} 
                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all group"
                    >
                        <div className="bg-slate-100 p-2 rounded-full group-hover:bg-indigo-100 transition-colors">
                            <Plus size={20} />
                        </div>
                        <span className="font-medium text-sm">Add a memory for this day</span>
                    </button>

                    {dayEvents.length > 0 ? (
                        <div className="space-y-3">
                            {dayEvents.map(event => (
                                <div 
                                    key={event.id} 
                                    onClick={() => startEdit(event)} 
                                    className="bg-white border border-slate-200 rounded-xl p-3 flex gap-4 hover:shadow-md hover:border-slate-300 cursor-pointer transition-all group relative overflow-hidden"
                                >
                                    {/* Selection Indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getCategoryColor(event.categoryId)}`} />
                                    
                                    {event.imageUrl && (
                                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                                            <img src={event.imageUrl} className="w-full h-full object-cover" alt="Thumbnail" />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                                                {event.year}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                                {getCategoryName(event.categoryId)}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 truncate pr-6">{event.title}</h4>
                                        <p className="text-sm text-slate-500 line-clamp-1">{event.description}</p>
                                    </div>

                                    <div className="flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors">
                                        <Edit2 size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 italic">
                            No memories recorded for this date yet.
                        </div>
                    )}
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                     <button onClick={onClose} className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium text-slate-700 text-sm">Close</button>
                </div>
            </div>
        ) : (
            // --- FORM VIEW ---
            <>
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    {dayEvents.length > 0 && (
                        <button 
                            onClick={() => setMode('list')} 
                            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium mb-[-10px]"
                        >
                            <ArrowLeft size={14} /> Back to list
                        </button>
                    )}

                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Year</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-center"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-600">Category</label>
                                {!isAddingCategory && (
                                    <button onClick={() => setIsAddingCategory(true)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                                        <Plus size={14} /> New
                                    </button>
                                )}
                            </div>
                            {isAddingCategory ? (
                                <div className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        placeholder="Name" 
                                        className="w-full px-2 py-1 text-sm border rounded"
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                    />
                                    <div className="flex gap-1">
                                        {AVAILABLE_COLORS.slice(0, 3).map(c => (
                                            <div key={c} onClick={() => setNewCatColor(c)} className={`w-4 h-4 rounded-full cursor-pointer ${c} ${newCatColor === c ? 'ring-1 ring-black' : ''}`} />
                                        ))}
                                    </div>
                                    <button onClick={handleCreateCategory} className="bg-slate-900 text-white text-xs px-2 py-1 rounded">Add</button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategoryId(cat.id)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all border ${
                                                categoryId === cat.id
                                                ? `${cat.color} text-white border-transparent shadow-md`
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Memory Snapshot</label>
                        <div 
                            className={`relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all group ${imageUrl ? 'border-transparent' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400 cursor-pointer'}`}
                            onClick={() => !imageUrl && fileInputRef.current?.click()}
                        >
                            {imageUrl ? (
                                <>
                                    <img src={imageUrl} alt="Memory" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setImageUrl(undefined); }}
                                        className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center text-slate-400 pointer-events-none">
                                    <ImageIcon className="mx-auto mb-2" size={24} />
                                    <span className="text-xs">Click to upload</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Headline</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Best Night Ever"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">The Story</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What made this day special?"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 rounded-lg hover:from-violet-200 hover:to-fuchsia-200 transition-colors border border-violet-200 text-xs font-medium uppercase tracking-wider"
                    >
                        {isGenerating ? <>Loading...</> : <><Sparkles size={14} /> Enhance Meaning with Gemini</>}
                    </button>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
                    {editingId ? (
                        <button onClick={handleDeleteCurrent} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 px-3 py-2 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 size={16} /> Delete
                        </button>
                    ) : <div></div>}
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => dayEvents.length > 0 ? setMode('list') : onClose()} 
                            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                        >
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default DayModal;