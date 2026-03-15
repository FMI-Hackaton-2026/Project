import { create } from 'zustand';
import { UserProfile, ViewState, Message } from '../types';

const SURGE_DURATION_MS = 20 * 60 * 1000; // 20 minutes

interface AppState {
  // Navigation & Core State
  currentView: ViewState;
  isSurgeActive: boolean;
  surgeStartedAt: number | null;
  lastSurgeSubmittedAt: number | null;
  
  // User Data
  userProfile: UserProfile;
  
  // Chat State
  messages: Message[];
  isTyping: boolean;
  
  // Actions
  setView: (view: ViewState) => void;
  triggerSurge: () => void;
  deactivateSurge: () => void;
  setSurgeSubmitted: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  appendMessageChunk: (chunk: string) => void;
  setTyping: (isTyping: boolean) => void;
}

export { SURGE_DURATION_MS };

const initialProfile: UserProfile = {
  resilienceScore: 0,
  daysWithoutGambling: 0,
  completedExercises: 0,
  isProfileComplete: false,
};

export const useAppStore = create<AppState>((set) => ({
  currentView: 'chat',
  isSurgeActive: false,
  surgeStartedAt: null,
  lastSurgeSubmittedAt: null,
  userProfile: initialProfile,
  messages: [],
  isTyping: false,
  
  setView: (view) => set({ currentView: view }),
  triggerSurge: () => set({ isSurgeActive: true, surgeStartedAt: Date.now() }),
  deactivateSurge: () => set({ isSurgeActive: false, surgeStartedAt: null }),
  setSurgeSubmitted: () => set({ lastSurgeSubmittedAt: Date.now() }),
  updateProfile: (updates) => set((state) => ({
    userProfile: { ...state.userProfile, ...updates }
  })),
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }]
  })),
  appendMessageChunk: (chunk) => set((state) => {
    const messages = [...state.messages];
    if (messages.length === 0) return state;
    
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === 'ai') {
      // Append strictly to existing AI string without rewriting entirely
      lastMsg.text += chunk;
      return { messages, isTyping: false };
    } else {
      // It's the very first chunk after a user string, so create new message
      return { 
        messages: [...state.messages, { id: crypto.randomUUID(), timestamp: Date.now(), sender: 'ai', text: chunk }],
        isTyping: false 
      };
    }
  }),
  setTyping: (isTyping) => set({ isTyping }),
}));
