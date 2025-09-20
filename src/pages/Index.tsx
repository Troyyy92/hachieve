import { DomainCard } from "@/components/DomainCard";
import { GoalCard } from "@/components/GoalCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Domain } from "@/types";
import {
  Briefcase,
  HeartPulse,
  Lightbulb,
  LineChart,
  Network,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

const domains: Domain[] = [
  { id: "leadership", title: "Leadership", icon: Users, progress: 45 },
  { id: "competences", title: "Compétences", icon: Lightbulb, progress: 70 },
  { id: "reseau", title: "Réseau", icon: Network, progress: 30 },
  { id: "sante", title: "Santé", icon: HeartPulse, progress: 85 },
  { id: "finances", title: "Finances", icon: LineChart, progress: 60 },
  { id: "equilibre", title: "Équilibre Pro/Perso", icon: Scale, progress: 50 },
  { id: "formation", title: "Formation", icon: Briefcase, progress: 20 },
  { id: "confiance", title: "Confiance", icon: ShieldCheck, progress: 75 },
];

const Index = () => {
  const mainGoal = "Devenir un expert reconnu";
  const firstHalf = domains.slice(0, 4);
  const secondHalf = domains.slice(4);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Mon Plan de Développement
          </h1>
          <p className="text-muted-foreground mt-2">
            Votre tableau de bord pour atteindre vos objectifs avec la méthode
            Harada.
          </p>
        </header>

        <main className="grid grid-cols-3 gap-4 md:gap-6">
          {firstHalf.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
          <GoalCard title={mainGoal} />
          {secondHalf.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </main>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;