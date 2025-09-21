import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Step5ValidationProps {
  goal: string;
  domains: string[];
  onSubmit: () => void;
  onBack: () => void;
}

export const Step5Validation = ({ goal, domains, onSubmit, onBack }: Step5ValidationProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    // Simule la création du plan
    setTimeout(() => {
      onSubmit();
      // Le chargement s'arrêtera car le composant sera démonté
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('wizard.step5_title')}</CardTitle>
        <CardDescription>
          {t('wizard.step5_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-secondary">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 mr-3 text-primary" />
            <h3 className="font-semibold text-lg">{t('wizard.step5_your_goal')}</h3>
          </div>
          <p className="text-muted-foreground pl-8">{goal}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t('wizard.step5_your_domains', { count: domains.length })}</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 list-none pl-0">
            {domains.map((domain) => (
              <li key={domain} className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-primary" />
                <span className="text-foreground">{domain}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.previous')}
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('wizard.step5_button_loading')}
            </>
          ) : (
            t('wizard.step5_button')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};