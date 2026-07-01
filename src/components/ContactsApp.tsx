import React, { useState } from 'react';
import { Search, UserPlus, Phone, MessageSquare, Mail, MapPin, X, ArrowLeft, Trash2 } from 'lucide-react';
import { Contact } from '../types';

interface ContactsAppProps {
  darkMode: boolean;
  onOpenApp?: (appId: string) => void;
  contacts?: Contact[];
  onAddContact?: (contact: Contact) => void;
  onDeleteContact?: (id: string) => void;
}

export default function ContactsApp({ 
  darkMode, 
  onOpenApp, 
  contacts: propContacts, 
  onAddContact, 
  onDeleteContact 
}: ContactsAppProps) {
  const [localContacts, setLocalContacts] = useState<Contact[]>([
    { id: 'mother', name: 'Mãe ❤️', avatar: '👩', role: 'Mãe', phone: '(11) 99222-3344', email: 'mamae.querida@email.com', location: 'São Paulo, SP' },
    { id: 'love', name: 'Amor 💖', avatar: '🥰', role: 'Namorada', phone: '(11) 99888-7766', email: 'meu.amor@email.com', location: 'São Paulo, SP' },
    { id: 'grandmother', name: 'Vovó 👵', avatar: '👵', role: 'Família', phone: '(11) 98765-4321', email: 'vovo.querida@email.com', location: 'Santos, SP' },
    { id: 'friend-lucas', name: 'Lucas 🤙', avatar: '👦', role: 'Amigo', phone: '(11) 99111-2233', email: 'lucas.friend@email.com', location: 'São Bernardo, SP' },
    { id: 'tech-support', name: 'Suporte Mock OS', avatar: '🛠️', role: 'Suporte Técnico', phone: '0800 123 456', email: 'suporte@mockos.io', location: 'Nuvem' },
  ]);

  const contacts = propContacts || localContacts;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Contact form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAvatar, setNewAvatar] = useState('👤');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newContact: Contact = {
      id: `custom-${Date.now()}`,
      name: newName,
      avatar: newAvatar,
      role: newRole || 'Contatos',
      phone: newPhone || '(11) 99999-9999',
      email: newEmail || 'novo.contato@email.com',
      location: newLocation || 'Brasil'
    };

    if (onAddContact) {
      onAddContact(newContact);
    } else {
      setLocalContacts(prev => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setShowAddModal(false);
    
    // Clear fields
    setNewName('');
    setNewRole('');
    setNewPhone('');
    setNewEmail('');
    setNewLocation('');
    setNewAvatar('👤');
  };

  const handleDeleteContact = (id: string) => {
    if (onDeleteContact) {
      onDeleteContact(id);
    } else {
      setLocalContacts(prev => prev.filter(c => c.id !== id));
    }
    setSelectedContact(null);
  };

  return (
    <div className={`w-full h-full flex flex-col ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} font-sans select-none`}>
      {/* Detail View Overlay */}
      {selectedContact && (
        <div className="absolute inset-0 z-50 flex flex-col bg-slate-900 text-white animate-fade-in p-6">
          <div className="flex justify-between items-center pb-6">
            <button 
              onClick={() => setSelectedContact(null)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white flex items-center gap-1.5 border-none cursor-pointer bg-transparent"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-semibold">Voltar</span>
            </button>
            <button 
              onClick={() => handleDeleteContact(selectedContact.id)}
              className="p-2 rounded-full hover:bg-red-500/20 text-red-400 border-none cursor-pointer bg-transparent"
              title="Excluir Contato"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-start space-y-6 pt-4">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-5xl shadow-lg border border-white/10">
              {selectedContact.avatar}
            </div>
            
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight">{selectedContact.name}</h2>
              <span className="inline-block bg-white/10 text-white/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {selectedContact.role}
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex gap-6 pt-2">
              <button 
                onClick={() => onOpenApp?.('telefone')}
                className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer text-green-400 hover:text-green-300"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <span className="text-[10px] font-bold">Ligar</span>
              </button>

              <button 
                onClick={() => onOpenApp?.('mensagens')}
                className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer text-blue-400 hover:text-blue-300"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <span className="text-[10px] font-bold">Conversar</span>
              </button>
            </div>

            {/* Info Fields Grid */}
            <div className="w-full max-w-sm space-y-2.5 pt-6 text-left">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Telefone</p>
                    <p className="text-xs font-semibold mt-0.5">{selectedContact.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Email</p>
                    <p className="text-xs font-semibold mt-0.5 truncate">{selectedContact.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Localização</p>
                    <p className="text-xs font-semibold mt-0.5">{selectedContact.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
          <form 
            onSubmit={handleAddContact}
            className="w-full max-w-sm bg-slate-900 rounded-3xl p-6 border border-white/10 space-y-4 text-white shadow-2xl"
          >
            <div className="flex justify-between items-center pb-1">
              <h3 className="font-bold text-sm">Novo Contato</h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 bg-transparent border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Emoji selector */}
            <div className="flex justify-center gap-2 py-2">
              {['👤', '👨', '👩', '🥰', '🤙', '👵', '👨‍💻'].map(em => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setNewAvatar(em)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all border-none cursor-pointer ${
                    newAvatar === em ? 'bg-blue-600 scale-110' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>

            <div className="space-y-3 text-xs text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do contato" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relação</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Amigo, Família" 
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(11) 99999-9999" 
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                <input 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Localização</label>
                <input 
                  type="text" 
                  placeholder="Ex: São Paulo, SP" 
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 text-xs pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border-none cursor-pointer text-white text-center"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold border-none cursor-pointer text-white text-center"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Primary Layout List view */}
      <div className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-xl font-bold tracking-tight">Contatos</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform flex items-center justify-center border-none cursor-pointer text-white"
            title="Adicionar Contato"
          >
            <UserPlus size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <input 
            type="text" 
            placeholder="Buscar contatos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border focus:outline-none focus:border-blue-500 ${
              darkMode 
                ? 'bg-slate-900/60 border-white/5 text-white placeholder-slate-500' 
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
            }`}
          />
        </div>

        {/* Contacts Grid/List */}
        <div className="space-y-2 pb-28">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xs">Nenhum contato encontrado.</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div 
                key={contact.id} 
                onClick={() => setSelectedContact(contact)}
                className={`p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-900/40 hover:bg-slate-900/70 border border-white/5' 
                    : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-xl border border-white/5 shadow-sm">
                    {contact.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{contact.name}</h4>
                    <span className="inline-block text-[8px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded mt-1">
                      {contact.role}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => onOpenApp?.('telefone')}
                    className="w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-500 flex items-center justify-center border-none cursor-pointer"
                  >
                    <Phone size={13} />
                  </button>
                  <button 
                    onClick={() => onOpenApp?.('mensagens')}
                    className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 flex items-center justify-center border-none cursor-pointer"
                  >
                    <MessageSquare size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
