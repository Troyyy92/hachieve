import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
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

interface GoalCardProps {
  goal: {
    title: string;
    description: string;
  };
  progress: number;
}

export const GoalCard = ({ goal, progress }: GoalCardProps) => {
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
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Card className="bg-primary text-primary-foreground flex flex-col items-center justify-center aspect-square p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1">
          <CardContent className="flex flex-col items-center justify-center text-center p-0 w-full">
            <Target className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-bold">Objectif Principal</h3>
            <p className="text-md text-primary-foreground/80 px-2">{goal.title}</p>
            <div className="w-full px-4 mt-4">
              <div className="text-right text-sm text-primary-foreground/80 mb-1">
                {progress}%
              </div>
              <Progress value={progress} className="[&>*]:bg-primary-foreground" />
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Objectif Principal</DialogTitle>
          <DialogDescription>
            Consultez et modifiez votre objectif principal.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="title" className="font-semibold">Titre</Label>
            <Input
              id="title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description" className="font-semibold">Description</Label>
            <Textarea
              id="description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="mt-1 min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Annuler</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};