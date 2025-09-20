import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Domain } from "@/types";
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

interface DomainCardProps {
  domain: Domain & { progress: number };
}

export const DomainCard = ({ domain }: DomainCardProps) => {
  const { updateDomain } = useData();

  const handleTogglePriority = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateDomain(domain.id, { isPriority: !domain.isPriority });
  };

  return (
    <div className="relative group">
      <Link to={`/domain/${domain.id}`}>
        <Card className={cn(
          "hover:shadow-xl hover:-translate-y-1 aspect-square flex flex-col bg-card",
          domain.isPriority && "bg-cyan-50 border-cyan-200"
        )}>
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center text-lg">
              <domain.icon className="w-5 h-5 mr-2 text-muted-foreground" />
              {domain.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <div className="text-right text-sm text-muted-foreground mb-1">
              {domain.progress}%
            </div>
            <Progress value={domain.progress} />
          </CardContent>
        </Card>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity"
        onClick={handleTogglePriority}
      >
        <Star className={cn("h-5 w-5", domain.isPriority ? "text-yellow-500 fill-yellow-400" : "text-muted-foreground")} />
      </Button>
    </div>
  );
};