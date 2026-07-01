import React, { useState } from 'react';
import { 
  Folder as FolderIcon, FileText, Image as ImageIcon, Music as MusicIcon, 
  ArrowLeft, X, Check, FilePlus, Trash2, Settings as SettingsIcon
} from 'lucide-react';

const renderFolderIcon = (iconName: string) => {
  switch (iconName) {
    case 'Folder': return <FolderIcon className="text-blue-500" size={32} />;
    case 'Image': return <ImageIcon className="text-pink-500" size={32} />;
    case 'Music': return <MusicIcon className="text-emerald-500" size={32} />;
    case 'Settings': return <SettingsIcon className="text-slate-500" size={32} />;
    default: return <FolderIcon className="text-blue-500" size={32} />;
  }
};
import { Folder, SystemFile } from '../types';

interface FilesAppProps {
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  darkMode: boolean;
  onSetWallpaper: (wpIdx: number) => void;
  onPlayTrack: (trackTitle: string) => void;
  isActive?: boolean;
}

export default function FilesApp({ 
  folders, 
  setFolders, 
  darkMode, 
  onSetWallpaper, 
  onPlayTrack,
  isActive = false
}: FilesAppProps) {
  const [activeFolderIdx, setActiveFolderIdx] = useState<number | null>(null);
  
  // Notepad states
  const [editingFile, setEditingFile] = useState<{ folderIdx: number; fileIdx: number; file: SystemFile } | null>(null);
  const [editorContent, setEditorContent] = useState('');
  
  // New file dialog
  const [creatingFileInFolderIdx, setCreatingFileInFolderIdx] = useState<number | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const currentFolder = activeFolderIdx !== null ? folders[activeFolderIdx] : null;

  // Handle system back gesture
  React.useEffect(() => {
    const handleBack = (e: Event) => {
      if (!isActive) return;
      if (editingFile !== null) {
        setEditingFile(null);
        e.preventDefault();
      } else if (activeFolderIdx !== null) {
        setActiveFolderIdx(null);
        e.preventDefault();
      }
    };
    window.addEventListener('mockos-back', handleBack);
    return () => window.removeEventListener('mockos-back', handleBack);
  }, [editingFile, activeFolderIdx, isActive]);

  // Save notepad text content
  const handleSaveText = () => {
    if (!editingFile) return;
    const { folderIdx, fileIdx } = editingFile;

    setFolders(prev => prev.map((f, fIdx) => {
      if (fIdx === folderIdx) {
        return {
          ...f,
          files: f.files.map((file, fItemIdx) => 
            fItemIdx === fileIdx ? { ...file, content: editorContent } : file
          )
        };
      }
      return f;
    }));

    setEditingFile(null);
  };

  // Add a new file in folder
  const handleCreateFile = () => {
    if (!newFileName.trim() || creatingFileInFolderIdx === null) return;
    const filename = newFileName.trim().endsWith('.txt') ? newFileName.trim() : `${newFileName.trim()}.txt`;
    
    const newFile: SystemFile = {
      name: filename,
      type: 'text',
      content: 'Nova anotação vazia. Escreva suas ideias aqui!',
      size: '42 B'
    };

    setFolders(prev => prev.map((f, idx) => {
      if (idx === creatingFileInFolderIdx) {
        return { ...f, files: [...f.files, newFile] };
      }
      return f;
    }));

    setNewFileName('');
    setCreatingFileInFolderIdx(null);
  };

  // Delete file
  const handleDeleteFile = (fIdx: number, fileIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolders(prev => prev.map((f, idx) => {
      if (idx === fIdx) {
        return {
          ...f,
          files: f.files.filter((_, iIdx) => iIdx !== fileIdx)
        };
      }
      return f;
    }));
  };

  const handleFileClick = (file: SystemFile, fileIdx: number) => {
    if (file.type === 'text' && activeFolderIdx !== null) {
      setEditingFile({
        folderIdx: activeFolderIdx,
        fileIdx,
        file
      });
      setEditorContent(file.content || '');
    } else if (file.type === 'image' && file.mediaRef) {
      const idx = parseInt(file.mediaRef);
      if (!isNaN(idx)) {
        onSetWallpaper(idx);
      }
    } else if (file.type === 'audio' && file.mediaRef) {
      onPlayTrack(file.mediaRef);
    }
  };

  return (
    <div className={`h-full flex flex-col rounded-none overflow-hidden ${
      darkMode ? 'text-white bg-slate-950' : 'text-slate-900 bg-white'
    }`}>
      
      {/* 1. DISK USAGE BAR HEADER */}
      <div className={`pt-3 pb-3 px-5 border-b flex flex-col gap-2 ${
        darkMode ? 'bg-slate-900/40 border-white/10' : 'bg-slate-100/50 border-slate-200'
      }`}>
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold">Armazenamento Interno</span>
          <span className="font-mono opacity-65 font-bold">45.2 GB usados de 128 GB</span>
        </div>
        <div className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: '35%' }} />
        </div>
      </div>

      {/* 2. EXPLORER WORKSPACE */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28 no-scrollbar">
        {currentFolder === null ? (
          /* Folders Root Grid view */
          <div className="grid grid-cols-2 gap-4">
            {folders.map((folder, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFolderIdx(idx)}
                className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-2.5 transition-all active:scale-95 cursor-pointer ${
                  darkMode 
                    ? 'bg-white/5 border-white/5 hover:bg-white/10' 
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100/80 shadow-sm'
                }`}
              >
                <span className="text-3xl">{renderFolderIcon(folder.icon)}</span>
                <div>
                  <h4 className="font-bold text-xs">{folder.name}</h4>
                  <p className="text-[10px] opacity-50 font-medium">{folder.files.length} itens</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Folder Files list view */
          <div className="space-y-4">
            {/* Header / Back row button */}
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <button 
                onClick={() => setActiveFolderIdx(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:underline"
              >
                <ArrowLeft size={14} /> Voltar para Pastas
              </button>
              
              <button
                onClick={() => setCreatingFileInFolderIdx(activeFolderIdx)}
                className="inline-flex items-center gap-1 text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm"
              >
                <FilePlus size={10} /> Criar Arquivo
              </button>
            </div>

            {/* Empty Folder text */}
            {currentFolder.files.length === 0 && (
              <p className="text-center py-10 text-xs opacity-40">Pasta vazia</p>
            )}

            {/* Folder list of files */}
            <div className="space-y-2">
              {currentFolder.files.map((file, fItemIdx) => (
                <div
                  key={fItemIdx}
                  onClick={() => handleFileClick(file, fItemIdx)}
                  className={`p-3 rounded-xl border flex justify-between items-center transition-colors cursor-pointer text-xs ${
                    darkMode 
                      ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' 
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-lg">
                      {file.type === 'text' && <FileText size={18} className="text-yellow-500" />}
                      {file.type === 'image' && <ImageIcon size={18} className="text-blue-500" />}
                      {file.type === 'audio' && <MusicIcon size={18} className="text-purple-500" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{file.name}</p>
                      <p className="text-[9px] opacity-50 font-medium font-mono">{file.size} • Clique para {
                        file.type === 'text' ? 'editar' : (file.type === 'image' ? 'usar papel de parede' : 'tocar música')
                      }</p>
                    </div>
                  </div>
                  
                  {file.type === 'text' && activeFolderIdx !== null && (
                    <button
                      onClick={(e) => handleDeleteFile(activeFolderIdx, fItemIdx, e)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NOTEPAD DIALOG TEXT EDITOR OVERLAY */}
      {editingFile && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-40">
          <div className={`w-full max-w-sm h-[80%] rounded-2xl flex flex-col overflow-hidden ${
            darkMode ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-950 shadow-2xl'
          }`}>
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/20">
              <span className="font-bold text-xs truncate max-w-[70%] flex items-center gap-1.5">
                <FileText size={14} className="text-yellow-500" /> Notepad - {editingFile.file.name}
              </span>
              <button 
                onClick={() => setEditingFile(null)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X size={14} />
              </button>
            </div>
            <textarea
              value={editorContent}
              onChange={e => setEditorContent(e.target.value)}
              className="flex-1 p-4 text-xs font-mono bg-transparent outline-none resize-none leading-relaxed"
              placeholder="Comece a escrever..."
            />
            <div className="p-3 border-t border-white/10 bg-black/10 flex justify-end gap-2">
              <button 
                onClick={() => setEditingFile(null)}
                className="px-3 py-1.5 bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveText}
                className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW FILE MODAL BOX */}
      {creatingFileInFolderIdx !== null && (
        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-40">
          <div className={`w-full max-w-xs rounded-2xl p-4 space-y-4 ${
            darkMode ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-950 shadow-2xl'
          }`}>
            <h3 className="font-bold text-xs">Criar Novo Arquivo (.txt)</h3>
            <input
              type="text"
              placeholder="Nome do arquivo..."
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
              }`}
            />
            <div className="flex justify-end gap-2 text-xs">
              <button 
                onClick={() => setCreatingFileInFolderIdx(null)}
                className="px-3 py-1.5 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateFile}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
