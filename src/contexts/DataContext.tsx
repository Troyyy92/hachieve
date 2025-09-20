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
  mainGoal: { title: string; description: string };
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

const initialTasks: Task[] = [
  { id: "1", domainId: "leadership", columnId: "todo", content: "Définir la vision du produit" },
  { id: "2", domainId: "leadership", columnId: "todo", content: "Contacter 5 mentors potentiels" },
  { id: "3", domainId: "leadership", columnId: "inprogress", content: "Lire un livre sur le leadership" },
  { id: "4", domainId: "leadership", columnId: "done", content: "Terminer le module de formation en ligne" },
  { id: "5", domainId: "competences", columnId: "done", content: "Finir le cours sur React" },
  { id: "6", domainId: "competences", columnId: "done", content: "Apprendre les bases de Python" },
  { id: "7", domainId: "sante", columnId: "todo", content: "Faire 3 séances de sport cette semaine" },
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [domains] = useState<Domain[]>(initialDomains);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [mainGoal, setMainGoal] = useState({
    title: "Devenir un expert reconnu",
    description: "Atteindre un niveau d'expertise dans mon domaine en développant mes compétences techniques, mon leadership et mon réseau professionnel. Cet objectif global est la somme de mes efforts dans les 8 domaines clés."
  });

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