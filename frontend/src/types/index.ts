export type ViewState = 'onboarding' | 'chat' | 'statistics';

export interface UserProfile {
  name?: string;
  familyValues?: string[];
  financialGoals?: string[];
  hobbies?: string[];
  resilienceScore: number;
  daysWithoutGambling: number;
  completedExercises: number;
  isProfileComplete: boolean;
}

export interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
  richCard?: RichCardData;
}

export interface RichCardData {
  type: 'video' | 'exercise' | 'article';
  title: string;
  description: string;
  thumbnailUrl?: string;
  actionText: string;
  actionPayload?: any;
}
