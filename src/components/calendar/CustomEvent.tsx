import { cn } from "@/lib/utils";

interface CustomEventProps {
  event: {
    title: string;
    isDone: boolean;
    domainTitle?: string;
  };
}

export const CustomEvent = ({ event }: CustomEventProps) => {
  return (
    <div className={cn(
      "p-1 rounded-md h-full text-xs text-left overflow-hidden border",
      event.isDone 
        ? "bg-secondary text-muted-foreground border-border" 
        : "bg-primary/10 text-primary border-primary/20"
    )}>
      <p className={cn(
        "font-medium",
        event.isDone && "line-through"
      )}>
        {event.title}
      </p>
      {event.domainTitle && (
        <p className="truncate opacity-80">
          {event.domainTitle}
        </p>
      )}
    </div>
  );
};