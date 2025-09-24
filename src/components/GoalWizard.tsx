import { useState } from "react";
import { WizardSteps } from "./wizard/WizardSteps";
import { Step1Goal } from "./wizard/Step1Goal";
import { Step2Discovery } from "./wizard/Step2Discovery";
import { Step3Domains } from "./wizard/Step3Domains";
import { Step4Customization } from "./wizard/Step4Customization";
import { Step5Validation } from "./wizard/Step5Validation";
import { useData } from "@/contexts/DataContext";
import { useTranslation } from "react-i18next";

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

const domainTemplates = {
  career: ["Compétences techniques", "Leadership", "Réseau professionnel", "Formation continue", "Visibilité interne", "Gestion de projet", "Communication", "Performance mesurable"],
  sport: ["Technique de base", "Endurance", "Force/vitesse", "Nutrition", "Récupération", "Mental", "Équipement", "Planification d'entraînement"],
  business: ["Produit/Service", "Marché/clients", "Financement", "Équipe", "Marketing", "Légal/admin", "Technologie", "Réseau/partenaires"],
  general: ["Développement personnel", "Santé & Bien-être", "Relations sociales", "Finances personnelles", "Environnement", "Contribution", "Loisirs & Passions", "Apprentissage continu"],
};

type GoalCategory = keyof typeof questionsByCategory;

export const GoalWizard = () => {
  const { t } = useTranslation();
  const { setupProject } = useData();
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
      .map(([question, answer]) => `Q: ${question}\nA: ${answer || t('common.notApplicable')}`) // Nouvelle clé
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
        return <div>{t('common.stepComingSoon', { step: currentStep })}</div>; // Nouvelle clé
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