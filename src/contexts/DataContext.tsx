import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Domain, Task } from "@/types";
import { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { getIconComponent, iconNames } from "@/lib/icons";
import { showError, showSuccess } from "@/utils/toast";

interface DataContextType {
  domains: Domain[];
  tasks: Task[];
  mainGoal: { title: string; description: string } | null;
  loading: boolean;
  addTask: (domainId: string, data: { content: string; description?: string; startDate?: string; endDate?: string; isAllDay?: boolean; }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateMainGoal: (title: string, description: string) => Promise<void>;
  setupProject: (goal: { title: string; description: string }, domainTitles: string[]) => Promise<void>;
  updateDomain: (id: string, updates: Partial<Omit<Domain, 'id'>>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const transformDomain = (dbDomain: any): Domain => ({
  id: dbDomain.id,
  title: dbDomain.title,
  description: dbDomain.description,
  isPriority: dbDomain.is_priority,
  icon: getIconComponent(dbDomain.icon_name),
});

const transformTask = (dbTask: any): Task => ({
  id: dbTask.id,
  domainId: dbTask.domain_id,
  columnId: dbTask.column_id,
  content: dbTask.content,
  description: dbTask.description,
  startDate: dbTask.start_date,
  endDate: dbTask.end_date,
  isPriority: dbTask.is_priority,
  isAllDay: dbTask.is_all_day,
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mainGoal, setMainGoal] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: goalData, error: goalError } = await supabase.from('main_goals').select('*').eq('user_id', user.id).single();
      if (goalError && goalError.code !== 'PGRST116') throw goalError;
      setMainGoal(goalData ? { title: goalData.title, description: goalData.description || '' } : null);

      if (goalData) {
        const { data: domainsData, error: domainsError } = await supabase.from('domains').select('*').eq('user_id', user.id);
        if (domainsError) throw domainsError;
        setDomains(domainsData.map(transformDomain));

        const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').eq('user_id', user.id);
        if (tasksError) throw tasksError;
        setTasks(tasksData.map(transformTask));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      showError("Impossible de charger vos données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setDomains([]);
      setTasks([]);
      setMainGoal(null);
      setLoading(false);
    }
  }, [user]);

  const setupProject = async (goal: { title: string; description: string }, domainTitles: string[]) => {
    if (!user) return;
    try {
      const { data: newGoal, error: goalError } = await supabase.from('main_goals').insert({ ...goal, user_id: user.id }).select().single();
      if (goalError) throw goalError;

      const newDomainsData = domainTitles.map((title, index) => ({
        user_id: user.id,
        title: title,
        icon_name: iconNames[index % iconNames.length],
        description: "Ajoutez une description pour ce domaine afin de clarifier son périmètre et ses objectifs.",
        is_priority: false,
      }));
      const { data: newDomains, error: domainsError } = await supabase.from('domains').insert(newDomainsData).select();
      if (domainsError) throw domainsError;

      setMainGoal({ title: newGoal.title, description: newGoal.description || '' });
      setDomains(newDomains.map(transformDomain));
      showSuccess("Votre plan a été créé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
      showError("Une erreur est survenue lors de la création de votre plan.");
    }
  };

  const updateMainGoal = async (title: string, description: string) => {
    if (!user || !mainGoal) return;
    const { data, error } = await supabase.from('main_goals').update({ title, description }).eq('user_id', user.id).select().single();
    if (error) {
      showError("Erreur lors de la mise à jour de l'objectif.");
    } else if (data) {
      setMainGoal({ title: data.title, description: data.description || '' });
      showSuccess("Objectif principal mis à jour.");
    }
  };

  const updateDomain = async (id: string, updates: Partial<Omit<Domain, 'id' | 'icon'>>) => {
    if (!user) return;
    const dbUpdates = {
      title: updates.title,
      description: updates.description,
      is_priority: updates.isPriority,
    };
    const { data, error } = await supabase.from('domains').update(dbUpdates).eq('id', id).select().single();
    if (error) {
      showError("Erreur lors de la mise à jour du domaine.");
    } else if (data) {
      setDomains(prev => prev.map(d => d.id === id ? transformDomain(data) : d));
    }
  };

  const addTask = async (domainId: string, taskData: { content: string; description?: string; startDate?: string; endDate?: string; isAllDay?: boolean; }) => {
    if (!user) return;
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      domain_id: domainId,
      column_id: 'todo',
      content: taskData.content,
      description: taskData.description,
      start_date: taskData.startDate,
      end_date: taskData.endDate,
      is_all_day: taskData.isAllDay,
      is_priority: false,
    }).select().single();
    if (error) {
      showError("Erreur lors de l'ajout de la tâche.");
    } else if (data) {
      setTasks(prev => [...prev, transformTask(data)]);
      showSuccess("Tâche ajoutée.");
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!user) return;
    const dbUpdates = {
      domain_id: updates.domainId,
      column_id: updates.columnId,
      content: updates.content,
      description: updates.description,
      start_date: updates.startDate,
      end_date: updates.endDate,
      is_priority: updates.isPriority,
      is_all_day: updates.isAllDay,
    };
    const { data, error } = await supabase.from('tasks').update(dbUpdates).eq('id', id).select().single();
    if (error) {
      showError("Erreur lors de la mise à jour de la tâche.");
    } else if (data) {
      setTasks(prev => prev.map(t => t.id === id ? transformTask(data) : t));
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      showError("Erreur lors de la suppression de la tâche.");
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
      showSuccess("Tâche supprimée.");
    }
  };

  return (
    <DataContext.Provider value={{ domains, tasks, mainGoal, loading, addTask, updateTask, deleteTask, setTasks, updateMainGoal, setupProject, updateDomain }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData doit être utilisé dans un DataProvider");
  }
  return context;
};