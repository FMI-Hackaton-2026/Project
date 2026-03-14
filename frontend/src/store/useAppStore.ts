import { create } from 'zustand';
import { UserProfile, ViewState, Message } from '../types';

interface AppState {
  // Navigation & Core State
  currentView: ViewState;
  isSurgeActive: boolean;
  
  // User Data
  userProfile: UserProfile;
  
  // Chat State
  messages: Message[];
  isTyping: boolean;
  
  // Actions
  setView: (view: ViewState) => void;
  triggerSurge: () => void;
  deactivateSurge: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (isTyping: boolean) => void;
}

const initialProfile: UserProfile = {
  resilienceScore: 0,
  daysWithoutGambling: 0,
  completedExercises: 0,
  isProfileComplete: false,
};

export const useAppStore = create<AppState>((set) => ({
  currentView: 'chat',
  isSurgeActive: false,
  userProfile: initialProfile,
  messages: [],
  isTyping: false,
  
  setView: (view) => set({ currentView: view }),
  triggerSurge: () => set({ isSurgeActive: true }),
  deactivateSurge: () => set({ isSurgeActive: false }),
  updateProfile: (updates) => set((state) => ({
    userProfile: { ...state.userProfile, ...updates }
  })),
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }]
  })),
  setTyping: (isTyping) => set({ isTyping }),
}));
