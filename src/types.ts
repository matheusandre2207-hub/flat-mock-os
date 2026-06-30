export interface Wallpaper {
  name: string;
  gradient: string;
  isDark: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  app: string;
}

export interface Track {
  title: string;
  artist: string;
  duration: string; // MM:SS
  durationSec: number;
  genre: string;
  color: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  role: string;
  messages: Message[];
  unread: boolean;
}

export interface SystemFile {
  name: string;
  type: 'text' | 'image' | 'audio';
  content?: string; // for text files
  size: string;
  mediaRef?: string; // wallpaper index or track title
}

export interface Folder {
  name: string;
  icon: string;
  files: SystemFile[];
}
