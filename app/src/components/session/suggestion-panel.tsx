"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SuggestionCard } from "./suggestion-card";
import { SuggestionDialog } from "./suggestion-dialog";
import { useSessionStore } from "../../providers/store-provider";

export function SuggestionsPanel() {
  const { suggestions, suggestionsLoading } = useSessionStore((state) => state);
  
  const [selectedSuggestion, setSelectedSuggestion] = useState<{
    title: string;
    description: string;
  } | null>(null);

  if (suggestions.length === 0 && !suggestionsLoading) {
    return null;
  }

  return (
    <div className="p-4 pt-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Suggested questions
      </h3>

      {suggestionsLoading && (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Generating...</span>
        </div>
      )}

      {!suggestionsLoading && suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              title={suggestion.title}
              onClick={() => setSelectedSuggestion({
                title: suggestion.title,
                description: suggestion.description,
              })}
            />
          ))}
        </div>
      )}

      {selectedSuggestion && (
        <SuggestionDialog
          open={!!selectedSuggestion}
          onOpenChange={(open) => !open && setSelectedSuggestion(null)}
          title={selectedSuggestion.title}
          description={selectedSuggestion.description}
        />
      )}
    </div>
  );
}