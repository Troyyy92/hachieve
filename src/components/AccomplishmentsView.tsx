import { useData } from "@/contexts/DataContext";
import { AccomplishmentCard } from "./AccomplishmentCard";
import { Card, CardContent } from "./ui/card";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AccomplishmentsView = () => {
  const { t } = useTranslation();
  const { accomplishments } = useData();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">{t('accomplishments.title')}</h2>
      {accomplishments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accomplishments.sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()).map((goal) => (
            <AccomplishmentCard
              key={goal.id}
              goal={goal}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-4">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold">{t('accomplishments.noAccomplishmentsTitle')}</h3>
            <p className="text-muted-foreground mt-2">{t('accomplishments.noAccomplishmentsDescription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};