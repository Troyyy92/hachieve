import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

interface CustomEventProps {
  event: {
    title: string;
    isDone: boolean;
    domainTitle?: string;
    isPriority?: boolean;
    description?: string;
  };
}

export const CustomEvent = ({ event }: CustomEventProps) => {
  const { t } = useTranslation();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "p-1 rounded-md h-full text-xs text-left overflow-hidden border",
          event.isDone
            ? "bg-secondary text-muted-foreground border-border"
            : event.isPriority
            ? "bg-[#ff93936b] text-foreground border-destructive/20"
            : "bg-primary/10 text-primary border-primary/20"
        )}>
          <p className={cn(
            "font-medium line-clamp-1", // Ajout de line-clamp-1
            event.isDone && "line-through"
          )}>
            {event.title}
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{event.title}</p>
        {event.domainTitle && (
          <p className="text-sm text-muted-foreground">
            {t('common.domain')}: {event.domainTitle}
          </p>
        )}
        {event.description ? (
          <p className="text-sm text-muted-foreground max-w-xs whitespace-pre-wrap">{event.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t('common.noDescription')}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};