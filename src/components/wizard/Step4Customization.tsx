import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, GripVertical, Plus, Target } from "lucide-react";
import { DomainTile } from "./DomainTile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface Step4CustomizationProps {
  goal: string;
  domains: string[];
  setDomains: (domains: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Customization = ({ goal, domains, setDomains, onNext, onBack }: Step4CustomizationProps) => {
  const { t } = useTranslation();
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [editingDomain, setEditingDomain] = useState<{ index: number; text: string } | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const domainIds = useMemo(() => domains, [domains]);
  const isGridValid = domains.length >= 1 && domains.length <= 8;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDomain(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDomain(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = domains.indexOf(active.id as string);
      const newIndex = domains.indexOf(over.id as string);
      setDomains(arrayMove(domains, oldIndex, newIndex));
    }
  };

  const handleDelete = (index: number) => {
    setDomains(domains.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    setEditingDomain({ index, text: domains[index] });
  };

  const handleUpdateDomain = () => {
    if (editingDomain) {
      const newDomains = [...domains];
      newDomains[editingDomain.index] = editingDomain.text;
      setDomains(newDomains);
      setEditingDomain(null);
    }
  };

  const handleAddDomain = () => {
    if (newDomain.trim() && domains.length < 8) {
      setDomains([...domains, newDomain.trim()]);
      setNewDomain("");
      setIsAddDialogOpen(false);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Card>
        <CardHeader>
          <CardTitle>{t('index.goalWizardStep4Title')}</CardTitle>
          <CardDescription>
            {t('index.goalWizardStep4Description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isGridValid && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>{t('index.customizeDomainsAlertTitle')}</AlertTitle>
              <AlertDescription>
                {t('index.customizeDomainsAlertDescription', { count: domains.length })}
              </AlertDescription>
            </Alert>
          )}
          <div className="mb-6 p-4 border rounded-lg bg-secondary flex flex-col items-center justify-center text-center">
            <Target className="w-8 h-8 mb-2 text-primary" />
            <h3 className="font-bold text-sm">{t('index.mainGoalTitle')}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{goal}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <SortableContext items={domainIds}>
              {domains.map((domain, index) => (
                <DomainTile
                  key={domain}
                  id={domain}
                  domain={domain}
                  onDelete={() => handleDelete(index)}
                  onEdit={() => handleEdit(index)}
                />
              ))}
            </SortableContext>
          </div>

          {domains.length < 8 && (
            <Button variant="outline" className="w-full mt-4" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> {t('index.addDomainButton')}
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <Button onClick={onNext} disabled={!isGridValid}>
            {t('index.validateDomains')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <DragOverlay>
        {activeDomain ? (
          <div className="bg-secondary rounded-lg flex items-center justify-center text-center p-2 aspect-square shadow-xl cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
            <p className="text-sm font-medium text-secondary-foreground">{activeDomain}</p>
          </div>
        ) : null}
      </DragOverlay>

      <Dialog open={!!editingDomain} onOpenChange={() => setEditingDomain(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('index.editDomainTitle')}</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="domain-text">{t('index.domainName')}</Label>
            <Input
              id="domain-text"
              value={editingDomain?.text || ''}
              onChange={(e) => setEditingDomain(d => d ? { ...d, text: e.target.value } : null)}
              className="mt-1"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{editingDomain?.text.length || 0}/50</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">{t('common.cancel')}</Button></DialogClose>
            <Button type="button" onClick={handleUpdateDomain}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('index.newDomainTitle')}</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-domain-text">{t('index.domainName')}</Label>
            <Input
              id="new-domain-text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="mt-1"
              placeholder={t('index.addDomainCardPlaceholder')}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{newDomain.length}/50</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">{t('common.cancel')}</Button></DialogClose>
            <Button type="button" onClick={handleAddDomain}>{t('common.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
};