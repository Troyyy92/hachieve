import { useTranslation } from "react-i18next";

interface WizardStepsProps {
  currentStep: number;
  totalSteps: number;
}

export const WizardSteps = ({ currentStep, totalSteps }: WizardStepsProps) => {
  const { t } = useTranslation();
  const steps = [
    t("index.goalWizardStep1Title"),
    t("index.goalWizardStep2Title"),
    t("index.goalWizardStep3Title"),
    t("index.goalWizardStep4Title"),
    t("index.goalWizardStep5Title"),
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((title, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {stepNumber}
              </div>
              <p className={`mt-2 text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {title}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-2 h-1 bg-secondary rounded-full">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};