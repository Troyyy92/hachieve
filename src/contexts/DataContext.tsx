import { createContext, useContext, useState, ReactNode } from "react";
import { Domain, Task } from "@/types";
import {
  Briefcase,
  HeartPulse,
  Lightbulb,
  LineChart,
  Network,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface DataContextType {
  domains: Domain[];
  tasks: Task[];
  mainGoal: { title: string; description: string } | null;
  addTask: (content: string, domainId: string) => void;
  updateTask: (id: string, newContent: string) => void;
  deleteTask: (id: string) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateMainGoal: (title: string, description: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialDomains: Domain[] = [
  { id: "leadership", title: "Leadership", icon: Users },
  { id: "competences", title: "Compétences", icon: Lightbulb },
  { id: "reseau", title: "Réseau", icon: Network },
  { id: "sante", title: "Santé", icon: HeartPulse },
  { id: "finances", title: "Finances", icon: LineChart },
  { id: "equilibre", title: "Équilibre Pro/Perso", icon: Scale },
  { id: "formation", title: "Formation", icon: Briefcase },
  { id: "confiance", title: "Confiance", icon: ShieldCheck },
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [domains] = useState<Domain[]>(initialDomains);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mainGoal, setMainGoal] = useState<{ title: string; description: string } | null>(null);

  const addTask = (content: string, domainId: string) => {
    const newTask: Task = {
      id: uuidv4(),
      domainId,
      columnId: "todo",
      content,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, newContent: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, content: newContent } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateMainGoal = (title: string, description: string) => {
    setMainGoal({ title, description });
  };

  return (
    <DataContext.Provider value={{ domains, tasks, mainGoal, addTask, updateTask, deleteTask, setTasks, updateMainGoal }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};