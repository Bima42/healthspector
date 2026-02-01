export interface Suggestion {
    id: string;
    sessionId: string;
    title: string;
    description: string;
    index: number;
    createdAt: Date;
  }
  
  export interface NewSuggestion {
    sessionId: string;
    title: string;
    description: string;
    index: number;
  }
  
  export interface SuggestionsResponse {
    suggestions: Array<{
      title: string;
      description: string;
    }>;
  }