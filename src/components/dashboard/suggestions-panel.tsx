import { HelpCircle, PiggyBank, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AiSuggestion } from "@/types/ai";

const ICON: Record<AiSuggestion["type"], typeof HelpCircle> = {
  question: HelpCircle,
  savings: PiggyBank,
  observation: Lightbulb,
};

const LABEL: Record<AiSuggestion["type"], string> = {
  question: "Ask support",
  savings: "Possible savings",
  observation: "Observation",
};

export function SuggestionsPanel({ suggestions }: { suggestions: AiSuggestion[] }) {
  if (suggestions.length === 0) return null;

  return (
    <Card className="rounded-3xl">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-lg font-medium tracking-tight">AI Suggestions</h3>
        <div className="space-y-3">
          {suggestions.map((s, i) => {
            const Icon = ICON[s.type];
            return (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {LABEL[s.type]}
                  </p>
                  <p className="mt-1 text-sm">{s.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
