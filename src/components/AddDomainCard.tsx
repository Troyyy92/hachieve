import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useData } from "@/contexts/DataContext";
import { iconComponents, iconNames } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const AddDomainCard = () => {
  const { addDomain } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(iconNames[0]);

  const handleSave = () => {
    if (title.trim()) {
      addDomain(title.trim(), selectedIcon);
      setIsDialogOpen(false);
      setTitle("");
      setSelectedIcon(iconNames[0]);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="border-dashed border-2 hover:border-primary hover:text-primary text-muted-foreground flex flex-col items-center justify-center min-h-56 p-4 cursor-pointer transition-colors">
          <CardContent className="flex flex-col items-center justify-center text-center p-0">
            <Plus className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-bold">Ajouter un domaine</h3>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouveau domaine</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau domaine d'action pour vous rapprocher de votre objectif.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="title" className="font-semibold">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              placeholder="Ex: Santé & Bien-être"
            />
          </div>
          <div>
            <Label className="font-semibold">Icône</Label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {iconNames.map(iconName => {
                const IconComponent = iconComponents[iconName];
                return (
                  <Button
                    key={iconName}
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedIcon(iconName)}
                    className={cn(selectedIcon === iconName && "ring-2 ring-primary")}
                  >
                    <IconComponent className="h-5 w-5" />
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Annuler</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!title.trim()}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};