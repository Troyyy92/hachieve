import { Link, useParams } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

import { Column, ColumnId, Task } from "@/types";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanTaskCard } from "@/components/KanbanTaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialColumns: Column[] = [
  { id: "todo", title: "À faire" },
  { id: "inprogress", title: "En cours" },
  { id: "done", title: "Terminé" },
];

const initialTasks: Task[] = [
  { id: "1", columnId: "todo", content: "Définir la vision du produit" },
  { id: "2", columnId: "todo", content: "Contacter 5 mentors potentiels" },
  { id: "3", columnId: "inprogress", content: "Lire un livre sur le leadership" },
  { id: "4", columnId: "done", content: "Terminer le module de formation en ligne" },
];

const KanbanView = () => {
  const { domainName } = useParams();
  const [columns] = useState<Column[]>(initialColumns);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTaskContent, setNewTaskContent] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleAddTask = () => {
    if (!newTaskContent.trim()) return;
    const newTask: Task = {
      id: uuidv4(),
      columnId: "todo",
      content: newTaskContent.trim(),
    };
    setTasks([...tasks, newTask]);
    setNewTaskContent("");
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const isActiveATask = active.data.current?.type === "Task";
    if (!isActiveATask) return;

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === active.id);
      const overIndex = tasks.findIndex((t) => t.id === over.id);

      if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
        tasks[activeIndex].columnId = tasks[overIndex].columnId;
        return arrayMove(tasks, activeIndex, overIndex - 1);
      }

      return arrayMove(tasks, activeIndex, overIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === active.id);
        const overIndex = tasks.findIndex((t) => t.id === over.id);

        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex);
        }
        return tasks;
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === active.id);
        tasks[activeIndex].columnId = over.id as ColumnId;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">
          Vue d'ensemble
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-primary capitalize">{domainName}</span>
      </div>

      <h1 className="text-3xl font-bold mb-2 capitalize">
        Tableau Kanban : {domainName}
      </h1>
      <div className="mb-6">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Nouvelle tâche..."
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button type="submit" onClick={handleAddTask}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SortableContext items={columnsId}>
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasks.filter((task) => task.columnId === col.id)}
              />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeTask && <KanbanTaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanView;