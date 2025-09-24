import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Step2DiscoveryProps {
  questions: string[];
  answers: { [key: string]: string };
  onAnswerChange: (question: string, answer: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Discovery = ({ questions, answers, onAnswerChange, onNext, onBack }: Step2DiscoveryProps) => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      onNext();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      onBack();
    } else {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('index.goalWizardStep2Title')}</CardTitle>
        <CardDescription>
          {t('index.goalWizardStep2Description')}
          <span className="block mt-2 font-medium text-primary">
            {t('index.goalWizardStep2Question', { current: currentQuestionIndex + 1, total: questions.length })}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label htmlFor="discovery-answer" className="font-semibold text-foreground mb-2 block">
          {currentQuestion}
        </label>
        <Textarea
          id="discovery-answer"
          placeholder={t('index.goalWizardStep2AnswerPlaceholder')}
          value={answers[currentQuestion] || ''}
          onChange={(e) => onAnswerChange(currentQuestion, e.target.value)}
          className="min-h-[120px] text-base"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <Button onClick={handleNext}>
          {isLastQuestion ? t('index.goalWizardStep2Finish') : t('common.next')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};