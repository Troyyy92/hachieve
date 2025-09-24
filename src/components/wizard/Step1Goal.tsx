import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Step1GoalProps {
  goal: string;
  setGoal: (value: string) => void;
  onSubmit: () => void;
}

export const Step1Goal = ({ goal, setGoal, onSubmit }: Step1GoalProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const isValid = goal.trim().length >= 10 && goal.trim().length <= 50;

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
        <CardTitle>{t('index.goalWizardStep1Title')}</CardTitle>
        <CardDescription>
          {t('index.goalWizardStep1Description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder={t('index.mainGoalPlaceholder')}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="min-h-[120px] text-base"
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground mt-2">
          {t('index.mainGoalMinLength', { count: goal.trim().length })} (10-50 caractères)
        </p>
        <Button onClick={handleSubmit} disabled={!isValid || isLoading} className="w-full mt-4">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('index.analysisInProgress')}
            </>
          ) : (
            t('index.analyzeGoalButton')
          )}
        </Button>
      </CardContent>
    </Card>
  );
};