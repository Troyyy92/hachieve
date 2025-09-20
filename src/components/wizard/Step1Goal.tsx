import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Step1GoalProps {
  goal: string;
  setGoal: (value: string) => void;
  onSubmit: () => void;
}

export const Step1Goal = ({ goal, setGoal, onSubmit }: Step1GoalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isValid = goal.trim().length >= 10;

  const handleSubmit = () => {
    if (!isValid) return;
    setIsLoading(true);
    // Simule une analyse de l'objectif
    setTimeout(() => {
      setIsLoading(false);
      onSubmit();
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quel est votre objectif principal ?</CardTitle>
        <CardDescription>
          Soyez précis et ambitieux. C'est le point de départ de votre réussite.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Ex: Devenir directeur commercial d'ici 2 ans, Courir un marathon en moins de 3h30, Lancer ma startup SaaS..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="min-h-[120px] text-base"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Minimum 10 caractères. Actuellement : {goal.trim().length}
        </p>
        <Button onClick={handleSubmit} disabled={!isValid || isLoading} className="w-full mt-4">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            "Analyser mon objectif"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};