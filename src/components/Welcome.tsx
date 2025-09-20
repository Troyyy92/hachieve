import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "./ui/label";
import { Lightbulb } from "lucide-react";

export const Welcome = () => {
  const { updateMainGoal } = useData();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      updateMainGoal(title.trim(), description.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">Bienvenue !</h1>
          <p className="text-muted-foreground text-lg">
            Commençons par définir votre objectif principal. C'est la première étape de la méthode Harada.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Qu'est-ce que la méthode Harada ?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
              <p>C'est une technique de développement personnel qui vous aide à atteindre des objectifs ambitieux.</p>
              <p>Elle consiste à définir un <strong>objectif central</strong>, puis à le décliner en <strong>8 domaines clés</strong> (compétences, santé, réseau...) que vous développerez via des actions concrètes.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <CardTitle>Besoin d'inspiration ?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                <li>Lancer mon projet de podcast sur la tech</li>
                <li>Courir un semi-marathon en moins de 2 heures</li>
                <li>Obtenir une promotion au poste de chef de projet</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Votre Objectif Principal</CardTitle>
              <CardDescription>Quel est le but que vous souhaitez atteindre ?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Titre de l'objectif</Label>
                <Input 
                  id="goal-title" 
                  placeholder="Ex: Devenir un expert reconnu" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-description">Description (optionnel)</Label>
                <Textarea 
                  id="goal-description" 
                  placeholder="Décrivez ce que cet objectif représente pour vous..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handleSubmit} disabled={!title.trim()} className="w-full">
                Définir mon objectif
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};