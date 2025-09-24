import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Step3DomainsProps {
  goal: string;
  domains: string[];
  onNext: () => void;
  onBack: () => void;
}

export const Step3Domains = ({ goal, domains, onNext, onBack }: Step3DomainsProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('index.goalWizardStep3Title')}</CardTitle>
        <CardDescription>
          {t('index.goalWizardStep3Description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center text-center">
          <Target className="w-8 h-8 mb-2" />
          <h3 className="font-bold text-sm">{t('index.mainGoalTitle')}</h3>
          <p className="text-xs text-primary-foreground/80 mt-1 line-clamp-3">{goal}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {domains.map((item) => (
            <div key={item} className="bg-secondary rounded-lg flex items-center justify-center text-center p-2 aspect-square">
              <p className="text-sm font-medium text-secondary-foreground">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <Button onClick={onNext}>
          {t('index.customizeDomains')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};