import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Domain } from "@/types";
import { Button } from "./ui/button";
import { Star, Trash2, MoreVertical } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface DomainCardProps {
  domain: Domain & { progress: number; taskCount: number };
}

export const DomainCard = ({ domain }: DomainCardProps) => {
  const { t } = useTranslation();
  const { updateDomain, deleteDomain } = useData();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { theme } = useTheme();
  const isSmallScreen = useBreakpoint(414); // true if screen width < 414px

  const handleTogglePriority = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateDomain(domain.id, { isPriority: !domain.isPriority });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteDomain(domain.id);
    setIsAlertOpen(false);
  };

  return (
    <div className="relative group h-full">
      <Card className={cn(
        "relative aspect-square border-none transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1",
        theme === "dark"
          ? (domain.isPriority ? "bg-dark-domain-priority" : "bg-dark-domain-card")
          : (domain.isPriority ? "bg-[#ff93936b]" : "bg-[#fff9ed]"),
        "w-full max-w-[200px] xs:max-w-[120px] sm:max-w-[200px] mx-auto"
      )}>
        <Link to={`/domain/${domain.id}`} className="block h-full">
          <div className="flex flex-col h-full">
            <CardHeader className="flex-shrink-0 p-3 xs:p-2 sm:p-6">
              <CardTitle className="flex items-center text-xs xs:text-xs sm:text-sm">
                <domain.icon className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-2 text-muted-foreground dark:text-white flex-shrink-0" />
                <span className="flex-1 line-clamp-2">{domain.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end p-3 xs:p-2 sm:px-6 sm:pb-6 pt-0">
              <div className="text-right text-xs xs:text-xs sm:text-sm text-muted-foreground dark:text-white mb-1">
                {domain.progress}%
              </div>
              <Progress value={domain.progress} />
            </CardContent>
          </div>
        </Link>

        {isSmallScreen && (
          // Mobile dropdown menu for screens < 414px, positioned inside the Card
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">{t('common.actions')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleTogglePriority}>
                  <Star className={cn("h-5 w-5 mr-2", domain.isPriority ? "text-yellow-500 fill-yellow-400" : "text-muted-foreground")} />
                  {domain.isPriority ? t('common.removePriority') : t('common.addPriority')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}> {/* Prevent dropdown from closing immediately */}
                      <Trash2 className="h-5 w-5 mr-2" /> {t('common.delete')}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('index.domainCardDeleteConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('index.domainCardDeleteConfirmDescription', { domainTitle: domain.title })}
                        {domain.taskCount > 0 && (
                          <span className="font-bold block mt-2">
                            {t('index.domainCardDeleteTaskWarning', { taskCount: domain.taskCount })}
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteConfirm}>{t('common.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </Card>

      {!isSmallScreen && (
        // Desktop/tablet direct buttons for screens >= 414px, positioned relative to the outer group div
        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleTogglePriority}
            aria-label="Toggle priority"
          >
            <Star className={cn("h-5 w-5", domain.isPriority ? "text-yellow-500 fill-yellow-400" : "text-muted-foreground dark:text-white")} />
          </Button>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white dark:hover:text-white"
                onClick={handleDeleteClick}
                aria-label="Delete domain"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('index.domainCardDeleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('index.domainCardDeleteConfirmDescription', { domainTitle: domain.title })}
                  {domain.taskCount > 0 && (
                    <span className="font-bold block mt-2">
                      {t('index.domainCardDeleteTaskWarning', { taskCount: domain.taskCount })}
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>{t('common.delete')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};