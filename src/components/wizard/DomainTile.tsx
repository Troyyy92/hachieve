import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DomainTileProps {
  id: string;
  domain: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const DomainTile = ({ id, domain, onEdit, onDelete }: DomainTileProps) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-secondary rounded-lg flex items-center justify-center text-center p-2 aspect-square"
    >
      <div className="flex items-center">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-2 -ml-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm font-medium text-secondary-foreground line-clamp-3">{domain}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('index.domainCardTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};