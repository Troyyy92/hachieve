import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MainGoal } from "@/contexts/DataContext";
import { PartyPopper } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompletionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  goal: MainGoal | null;
  onContinue: () => void;
  onNewGoal: () => void;
}

export const CompletionModal = ({ isOpen, onOpenChange, goal, onContinue, onNewGoal }: CompletionModalProps) => {
  const { t } = useTranslation();

  if (!goal) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <PartyPopper className="w-16 h-16 text-yellow-500" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            {t('completionModal.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t('completionModal.description', { goalTitle: goal.title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel onClick={onContinue}>
            {t('completionModal.continueButton')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onNewGoal}>
            {t('completionModal.newGoalButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};