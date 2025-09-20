import { useState } from "react";
import { WizardSteps } from "./wizard/WizardSteps";
import { Step1Goal } from "./wizard/Step1Goal";
import { Step2Discovery } from "./wizard/Step2Discovery";
import { useData } from "@/contexts/DataContext";

const TOTAL_STEPS = 5;

const questionsByCategory = {
  career: [
    "Quel poste ou niveau visez-vous exactement ?",
    "Quelles sont les 3 compétences clés qui vous manquent pour y arriver ?",
    "Quelle est votre échéance pour atteindre cet objectif ?",
    "Qui sont les personnes clés qui pourraient vous aider ?",
  ],
  sport: [
    "Quel est votre niveau de performance actuel ?",
    "Quelle est la date de l'événement ou l'échéance de votre objectif ?",
    "Quels sont les principaux obstacles que vous anticipez (physiques, mentaux) ?",
    "Comment prévoyez-vous de suivre vos progrès ?",
  ],
  business: [
    "Quel est le problème principal que votre projet résout ?",
    "Qui sont vos clients cibles ?",
    "Quelles sont vos premières sources de financement envisagées ?",
    "Quelle est la plus grande inconnue ou le plus grand risque actuel ?",
  ],
  general: [
    "Qu'est-ce qui rend cet objectif si important pour vous personnellement ?",
    "Comment saurez-vous que vous avez réussi ?",
    "Quels sont les premiers petits pas que vous pourriez faire dès cette semaine ?",
    "Qui peut vous soutenir dans cette démarche ?",
  ],
};

type GoalCategory = keyof typeof questionsByCategory;

export const GoalWizard = () => {
  const { updateMainGoal } = useData();
  const [currentStep, setCurrentStep] = useState(1);
  const [goal, setGoal] = useState({ title: "", description: "" });
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('general');
  const [discoveryAnswers, setDiscoveryAnswers] = useState<{ [key: string]: string }>({});

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const detectCategory = (goalText: string): GoalCategory => {
    const lowerGoal = goalText.toLowerCase();
    if (/\b(carrière|directeur|promotion|poste|emploi|manager)\b/.test(lowerGoal)) return 'career';
    if (/\b(marathon|courir|sport|compétition|match|course)\b/.test(lowerGoal)) return 'sport';
    if (/\b(startup|business|lancer|entreprise|saas|projet)\b/.test(lowerGoal)) return 'business';
    return 'general';
  };

  const handleGoalSubmit = () => {
    const category = detectCategory(goal.title);
    setGoalCategory(category);
    const initialAnswers = questionsByCategory[category].reduce((acc, q) => ({ ...acc, [q]: '' }), {});
    setDiscoveryAnswers(initialAnswers);
    console.log("Analyse de l'objectif :", goal.title, "Catégorie détectée:", category);
    nextStep();
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setDiscoveryAnswers(prev => ({ ...prev, [question]: answer }));
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Goal goal={goal.title} setGoal={(title) => setGoal({ ...goal, title })} onSubmit={handleGoalSubmit} />;
      case 2:
        return (
          <Step2Discovery
            questions={questionsByCategory[goalCategory]}
            answers={discoveryAnswers}
            onAnswerChange={handleAnswerChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      default:
        return <div>Étape {currentStep} à venir...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <WizardSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};