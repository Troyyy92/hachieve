import { useState } from "react";
import { WizardSteps } from "./wizard/WizardSteps";
import { Step1Goal } from "./wizard/Step1Goal";
import { useData } from "@/contexts/DataContext";

const TOTAL_STEPS = 5;

export const GoalWizard = () => {
  const { updateMainGoal } = useData();
  const [currentStep, setCurrentStep] = useState(1);
  const [goal, setGoal] = useState({ title: "", description: "" });

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

  const handleGoalSubmit = () => {
    // Pour l'instant, nous passons à l'étape suivante.
    // Plus tard, nous ajouterons l'analyse ici.
    console.log("Analyse de l'objectif :", goal.title);
    nextStep();
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Goal goal={goal.title} setGoal={(title) => setGoal({ ...goal, title })} onSubmit={handleGoalSubmit} />;
      // Les autres étapes seront ajoutées ici
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