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
        <CardTitle>{t('wizard.step1_title')}</CardTitle>
        <CardDescription>
          {t('wizard.step1_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder={t('wizard.step1_placeholder')}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="min-h-[120px] text-base"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {t('wizard.step1_char_count', { count: goal.trim().length })}
        </p>
        <Button onClick={handleSubmit} disabled={!isValid || isLoading} className="w-full mt-4">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('wizard.step1_button_loading')}
            </>
          ) : (
            t('wizard.step1_button')
          )}
        </Button>
      </CardContent>
    </Card>
  );
};