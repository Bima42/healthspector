"use client";

import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { SuggestionCard } from "./suggestion-card";
import { SuggestionDialog } from "./suggestion-dialog";
import { useSessionStore } from "../../providers/store-provider";
import { Separator } from "../ui/separator";

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
    <>
      <Separator className="my-2" />
      
      <div className="px-2 pb-2">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <h3 className="text-sm font-semibold">Suggestions</h3>
        </div>

        <p className="text-xs text-muted-foreground mb-3 px-2 leading-relaxed">
          Optional questions to help provide a more complete picture of your condition.
        </p>

        {suggestionsLoading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-xs">Generating suggestions...</span>
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

        {!suggestionsLoading && suggestions.length === 0 && (
          <p className="text-xs text-muted-foreground/60 text-center py-4 italic">
            No suggestions at the moment
          </p>
        )}
      </div>

      {selectedSuggestion && (
        <SuggestionDialog
          open={!!selectedSuggestion}
          onOpenChange={(open) => !open && setSelectedSuggestion(null)}
          title={selectedSuggestion.title}
          description={selectedSuggestion.description}
        />
      )}
    </>
  );
}