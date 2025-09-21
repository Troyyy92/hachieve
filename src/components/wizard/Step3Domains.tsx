import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";

interface Step3DomainsProps {
  goal: string;
  domains: string[];
  onNext: () => void;
  onBack: () => void;
}

export const Step3Domains = ({ goal, domains, onNext, onBack }: Step3DomainsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vos domaines de développement</CardTitle>
        <CardDescription>
          Voici une première suggestion de domaines clés pour atteindre votre objectif.
          Nous les personnaliserons à l'étape suivante.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center text-center">
          <Target className="w-8 h-8 mb-2" />
          <h3 className="font-bold text-sm">Objectif Principal</h3>
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
          Précédent
        </Button>
        <Button onClick={onNext}>
          Personnaliser
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};