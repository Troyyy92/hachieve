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
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

export const AddDomainCard = () => {
  const { t } = useTranslation();
  const { addDomain } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(iconNames[0]);
  const { theme } = useTheme();

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
        <Card className={cn(
          "border-dashed border-2 hover:border-primary hover:text-primary text-muted-foreground aspect-square cursor-pointer transition-colors",
          theme === "dark" ? "bg-dark-add-domain-card" : "bg-card",
          "w-full max-w-[200px] xs:max-w-[120px] sm:max-w-[200px] mx-auto"
        )}>
          <div className="flex flex-col items-center justify-center h-full p-3 xs:p-2">
            <Plus className="w-6 h-6 xs:w-6 xs:h-6 sm:w-7 sm:h-7 mb-2 xs:mb-4" />
            <h3 className="text-xs xs:text-xs sm:text-sm font-bold">{t('index.addDomainCardTitle')}</h3>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('index.newDomainTitle')}</DialogTitle>
          <DialogDescription>
            {t('index.newDomainDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="title" className="font-semibold">{t('common.title')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              placeholder={t('index.newDomainPlaceholder')}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{title.length}/50</p>
          </div>
          <div>
            <Label className="font-semibold">{t('common.icon')}</Label>
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
            <Button type="button" variant="secondary">{t('common.cancel')}</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={!title.trim()}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};