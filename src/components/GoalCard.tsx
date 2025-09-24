import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: {
    title: string;
    description: string;
  };
  progress: number;
}

export const GoalCard = ({ goal, progress }: GoalCardProps) => {
  const { t } = useTranslation();
  const { updateMainGoal } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(goal.title);
  const [editedDescription, setEditedDescription] = useState(goal.description);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditedTitle(goal.title);
      setEditedDescription(goal.description);
    }
    setIsDialogOpen(open);
  };

  const handleSave = () => {
    updateMainGoal(editedTitle, editedDescription);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Card className="bg-[#ffcb6c] text-[#2f2f2fcc] aspect-square cursor-pointer border-none transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 w-full max-w-[200px] xs:max-w-[120px] sm:max-w-[200px] mx-auto">
            <div className="flex flex-col items-center justify-between h-full p-3 xs:p-2 sm:p-6">
              <div className="flex flex-col items-center justify-center flex-grow text-center w-full">
                <p className={cn("text-xs xs:text-xs sm:text-sm font-semibold text-[#2f2f2fcc]/80 line-clamp-3 w-full")}>{goal.title}</p>
              </div>
              <div className="w-full mt-2 xs:mt-4">
                <div className="text-right text-xs xs:text-xs sm:text-sm text-[#2f2f2fcc]/80 mb-1">
                  {progress}%
                </div>
                <Progress value={progress} className="[&>*]:bg-green-500" />
              </div>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('index.mainGoalTitle')}</DialogTitle>
            <DialogDescription>
              {t('index.mainGoalDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="title" className="font-semibold">{t('common.title')}</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="mt-1"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{editedTitle.length}/50</p>
            </div>
            <div>
              <Label htmlFor="description" className="font-semibold">{t('common.description')}</Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="mt-1 min-h-[120px]"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{editedDescription.length}/300</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">{t('common.cancel')}</Button>
            </DialogClose>
            <Button type="button" onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
};