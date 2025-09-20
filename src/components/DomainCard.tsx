import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Domain } from "@/types";

interface DomainCardProps {
  domain: Domain;
}

export const DomainCard = ({ domain }: DomainCardProps) => {
  return (
    <Link to={`/domain/${domain.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300 aspect-square flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center text-lg">
            <domain.icon className="w-5 h-5 mr-2" />
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
  );
};