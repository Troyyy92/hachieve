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
  LucideIcon,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface DataContextType {
  domains: Domain[];
  tasks: Task[];
  mainGoal: { title: string; description: string } | null;
  addTask: (domainId: string, data: { content: string; description?: string; startDate?: string; endDate?: string; isAllDay?: boolean; }) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateMainGoal: (title: string, description: string) => void;
  setupProject: (goal: { title: string; description: string }, domainTitles: string[]) => void;
  updateDomain: (id: string, updates: Partial<Omit<Domain, 'id'>>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const iconPool: LucideIcon[] = [Users, Lightbulb, Network, HeartPulse, LineChart, Scale, Briefcase, ShieldCheck];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mainGoal, setMainGoal] = useState<{ title: string; description: string } | null>(null);

  const addTask = (domainId: string, data: { content: string; description?: string; startDate?: string; endDate?: string; isAllDay?: boolean; }) => {
    const newTask: Task = {
      id: uuidv4(),
      domainId,
      columnId: "todo",
      content: data.content,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      isPriority: false,
      isAllDay: data.isAllDay ?? false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateMainGoal = (title: string, description: string) => {
    setMainGoal({ title, description });
  };

  const updateDomain = (id: string, updates: Partial<Omit<Domain, 'id'>>) => {
    setDomains((prev) =>
      prev.map((domain) =>
        domain.id === id ? { ...domain, ...updates } : domain
      )
    );
  };

  const setupProject = (goal: { title: string; description: string }, domainTitles: string[]) => {
    setMainGoal(goal);
    const newDomains: Domain[] = domainTitles.map((title, index) => ({
      id: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + `-${uuidv4()}`,
      title: title,
      icon: iconPool[index % iconPool.length],
      description: "Ajoutez une description pour ce domaine afin de clarifier son périmètre et ses objectifs.",
      isPriority: false,
    }));
    setDomains(newDomains);
  };

  return (
    <DataContext.Provider value={{ domains, tasks, mainGoal, addTask, updateTask, deleteTask, setTasks, updateMainGoal, setupProject, updateDomain }}>
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