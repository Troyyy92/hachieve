import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Step2DiscoveryProps {
  questions: string[];
  answers: { [key: string]: string };
  onAnswerChange: (question: string, answer: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Discovery = ({ questions, answers, onAnswerChange, onNext, onBack }: Step2DiscoveryProps) => {
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
        <CardTitle>Approfondissons votre objectif</CardTitle>
        <CardDescription>
          Répondez à ces quelques questions pour clarifier votre vision.
          <span className="block mt-2 font-medium text-primary">Question {currentQuestionIndex + 1} sur {questions.length}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label htmlFor="discovery-answer" className="font-semibold text-foreground mb-2 block">
          {currentQuestion}
        </label>
        <Textarea
          id="discovery-answer"
          placeholder="Votre réponse..."
          value={answers[currentQuestion] || ''}
          onChange={(e) => onAnswerChange(currentQuestion, e.target.value)}
          className="min-h-[120px] text-base"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        <Button onClick={handleNext}>
          {isLastQuestion ? "Terminer & Suivant" : "Suivant"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};