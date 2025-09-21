import { useState, useMemo } from "react";
import { WizardSteps } from "./wizard/WizardSteps";
import { Step1Goal } from "./wizard/Step1Goal";
import { Step2Discovery } from "./wizard/Step2Discovery";
import { Step3Domains } from "./wizard/Step3Domains";
import { Step4Customization } from "./wizard/Step4Customization";
import { Step5Validation } from "./wizard/Step5Validation";
import { useData } from "@/contexts/DataContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

const TOTAL_STEPS = 5;

type GoalCategory = 'career' | 'sport' | 'business' | 'general';

export const GoalWizard = () => {
  const { setupProject } = useData();
  const { t } = useTranslation();
  
  const questionsByCategory = useMemo(() => ({
    career: [
      t('wizard.questions.career1'), t('wizard.questions.career2'), t('wizard.questions.career3'), t('wizard.questions.career4'),
    ],
    sport: [
      t('wizard.questions.sport1'), t('wizard.questions.sport2'), t('wizard.questions.sport3'), t('wizard.questions.sport4'),
    ],
    business: [
      t('wizard.questions.business1'), t('wizard.questions.business2'), t('wizard.questions.business3'), t('wizard.questions.business4'),
    ],
    general: [
      t('wizard.questions.general1'), t('wizard.questions.general2'), t('wizard.questions.general3'), t('wizard.questions.general4'),
    ],
  }), [t]);

  const domainTemplates = useMemo(() => ({
    career: [t('wizard.domains.career1'), t('wizard.domains.career2'), t('wizard.domains.career3'), t('wizard.domains.career4'), t('wizard.domains.career5'), t('wizard.domains.career6'), t('wizard.domains.career7'), t('wizard.domains.career8')],
    sport: [t('wizard.domains.sport1'), t('wizard.domains.sport2'), t('wizard.domains.sport3'), t('wizard.domains.sport4'), t('wizard.domains.sport5'), t('wizard.domains.sport6'), t('wizard.domains.sport7'), t('wizard.domains.sport8')],
    business: [t('wizard.domains.business1'), t('wizard.domains.business2'), t('wizard.domains.business3'), t('wizard.domains.business4'), t('wizard.domains.business5'), t('wizard.domains.business6'), t('wizard.domains.business7'), t('wizard.domains.business8')],
    general: [t('wizard.domains.general1'), t('wizard.domains.general2'), t('wizard.domains.general3'), t('wizard.domains.general4'), t('wizard.domains.general5'), t('wizard.domains.general6'), t('wizard.domains.general7'), t('wizard.domains.general8')],
  }), [t]);

  const [currentStep, setCurrentStep] = useState(1);
  const [goal, setGoal] = useState({ title: "", description: "" });
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('general');
  const [discoveryAnswers, setDiscoveryAnswers] = useState<{ [key: string]: string }>({});
  const [suggestedDomains, setSuggestedDomains] = useState<string[]>([]);
  const [customDomains, setCustomDomains] = useState<string[]>([]);

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
    if (/\b(carrière|directeur|promotion|poste|emploi|manager|career|director|promotion|job|manager)\b/.test(lowerGoal)) return 'career';
    if (/\b(marathon|courir|sport|compétition|match|course|run|competition|game|race)\b/.test(lowerGoal)) return 'sport';
    if (/\b(startup|business|lancer|entreprise|saas|projet|launch|company|project)\b/.test(lowerGoal)) return 'business';
    return 'general';
  };

  const handleGoalSubmit = () => {
    const category = detectCategory(goal.title);
    setGoalCategory(category);
    const initialAnswers = questionsByCategory[category].reduce((acc, q) => ({ ...acc, [q]: '' }), {});
    setDiscoveryAnswers(initialAnswers);
    nextStep();
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setDiscoveryAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const handleDiscoverySubmit = () => {
    const domains = domainTemplates[goalCategory];
    setSuggestedDomains(domains);
    setCustomDomains(domains);
    nextStep();
  };

  const handleFinalSubmit = () => {
    const description = Object.entries(discoveryAnswers)
      .map(([question, answer]) => `Q: ${question}\nA: ${answer || 'N/A'}`)
      .join('\n\n');
    
    setupProject({ title: goal.title, description }, customDomains);
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
            onNext={handleDiscoverySubmit}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <Step3Domains
            goal={goal.title}
            domains={suggestedDomains}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <Step4Customization
            goal={goal.title}
            domains={customDomains}
            setDomains={setCustomDomains}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <Step5Validation
            goal={goal.title}
            domains={customDomains}
            onSubmit={handleFinalSubmit}
            onBack={prevStep}
          />
        );
      default:
        return <div>{t('wizard.step_coming_soon', { step: currentStep })}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-2xl">
        <WizardSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};