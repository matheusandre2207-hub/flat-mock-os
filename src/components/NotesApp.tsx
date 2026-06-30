import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, FileText } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  date: string;
}

interface NotesAppProps {
  darkMode: boolean;
}

const COLORS = [
  { name: 'Amarelo', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border-amber-200/50 dark:border-amber-900/50' },
  { name: 'Azul', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border-blue-200/50 dark:border-blue-900/50' },
  { name: 'Verde', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 border-emerald-200/50 dark:border-emerald-900/50' },
  { name: 'Roxo', bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 border-purple-200/50 dark:border-purple-900/50' },
  { name: 'Rosa', bg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-200 border-pink-200/50 dark:border-pink-900/50' },
];

export default function NotesApp({ darkMode }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].bg);

  // Load notes
  useEffect(() => {
    const saved = localStorage.getItem('mockos_notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialNotes = [
        {
          id: '1',
          title: 'Lista de Compras 🛒',
          content: '- Café\n- Leite\n- Pão integral\n- Frutas frescas',
          color: COLORS[0].bg,
          date: 'Ontem',
        },
        {
          id: '2',
          title: 'Ideias de Projetos 💡',
          content: '1. Criar um simulador de smartphone em React (Mock OS!)\n2. Adicionar uma loja de aplicativos\n3. Implementar um jogo de Flappy Bird interativo',
          color: COLORS[1].bg,
          date: 'Hoje',
        }
      ];
      setNotes(initialNotes);
      localStorage.setItem('mockos_notes', JSON.stringify(initialNotes));
    }
  }, []);

  // Save notes
  const saveNotesToStorage = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('mockos_notes', JSON.stringify(newNotes));
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Nota',
      content: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)].bg,
      date: 'Agora',
    };
    const updated = [newNote, ...notes];
    saveNotesToStorage(updated);
    handleSelectNote(newNote);
  };

  const handleSelectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitleInput(note.title);
    setContentInput(note.content);
    setSelectedColor(note.color);
  };

  const handleUpdateNote = () => {
    if (!activeNoteId) return;
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return {
          ...n,
          title: titleInput || 'Sem título',
          content: contentInput,
          color: selectedColor,
          date: 'Agora',
        };
      }
      return n;
    });
    saveNotesToStorage(updated);
  };

  useEffect(() => {
    if (activeNoteId) {
      handleUpdateNote();
    }
  }, [titleInput, contentInput, selectedColor]);

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    saveNotesToStorage(updated);
    if (activeNoteId === id) {
      setActiveNoteId(null);
      setTitleInput('');
      setContentInput('');
    }
  };

  const filteredNotes = notes.filter(
    n => n.title.toLowerCase().includes(search.toLowerCase()) || 
         n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full select-none">
      {/* App Header */}
      <div className={`p-4 border-b flex justify-between items-center shrink-0 ${
        darkMode ? 'border-white/10 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <h2 className="text-sm font-bold">Bloco de Notas</h2>
        </div>
        <button 
          onClick={handleCreateNote}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-xs text-white font-bold rounded-xl border-none cursor-pointer shadow-sm"
        >
          <Plus size={14} />
          <span>Criar</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Notes List */}
        {activeNoteId === null ? (
          <div className={`w-full flex flex-col h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Search */}
            <div className="p-3 shrink-0">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar notas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-white text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-2 no-scrollbar pb-24">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <FileText size={28} className="mx-auto opacity-20" />
                  <p className="text-xs opacity-40">Nenhuma nota encontrada</p>
                </div>
              ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer active:scale-[0.98] relative group ${note.color}`}
                  >
                    <div className="pr-6">
                      <h3 className="font-bold text-xs truncate mb-1">{note.title}</h3>
                      <p className="text-[10.5px] opacity-75 line-clamp-2 leading-relaxed">{note.content || 'Sem conteúdo'}</p>
                    </div>
                    <span className="text-[9px] opacity-40 absolute bottom-1.5 right-3 font-mono">{note.date}</span>
                    <button 
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-all text-red-600 border-none bg-transparent cursor-pointer"
                      title="Excluir nota"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Right Side: Active Note Editor */
          <div className={`flex-1 flex flex-col h-full ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            {/* Editor Action Bar */}
            <div className={`px-4 py-2 flex justify-between items-center shrink-0 border-b ${
              darkMode ? 'border-white/5 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <button 
                onClick={() => setActiveNoteId(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                ← Voltar
              </button>

              {/* Color Picker */}
              <div className="flex gap-1.5">
                {COLORS.map(c => (
                  <button 
                    key={c.name}
                    onClick={() => setSelectedColor(c.bg)}
                    className={`w-5 h-5 rounded-full border cursor-pointer relative ${c.bg.split(' ')[0]} ${
                      selectedColor === c.bg ? 'ring-2 ring-blue-500' : 'border-white/20'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Note Fields */}
            <div className="flex-1 p-4 flex flex-col gap-2.5 overflow-y-auto pb-24">
              <input 
                type="text"
                placeholder="Título da nota"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className={`w-full text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-0 px-1 py-1.5 ${
                  darkMode ? 'text-white placeholder-white/30' : 'text-slate-800 placeholder-slate-400'
                }`}
              />
              <textarea 
                placeholder="Comece a escrever..."
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                className={`w-full flex-1 text-xs bg-transparent border-none focus:outline-none focus:ring-0 resize-none leading-relaxed p-1 ${
                  darkMode ? 'text-slate-300 placeholder-white/20' : 'text-slate-600 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
