import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

interface GoalCardProps {
  title: string;
}

export const GoalCard = ({ title }: GoalCardProps) => {
  return (
    <Card className="bg-primary text-primary-foreground flex flex-col items-center justify-center aspect-square p-4">
      <CardContent className="flex flex-col items-center justify-center text-center p-0">
        <Target className="w-10 h-10 mb-4" />
        <h3 className="text-lg font-bold">Objectif Principal</h3>
        <p className="text-md text-primary-foreground/80">{title}</p>
      </CardContent>
    </Card>
  );
};