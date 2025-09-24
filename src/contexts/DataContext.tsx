import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Domain, Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { getIconComponent, iconNames } from "@/lib/icons";
import { showError, showSuccess } from "@/utils/toast";
import { useTranslation } from "react-i18next";

// Définir un type pour les objectifs principaux
export interface MainGoal {
  id: string;
  title: string;
  description: string;
  created_at: string;
  completed_at?: string;
  domain_count?: number; // Nouvelle propriété
  task_count?: number;    // Nouvelle propriété
}

interface DataContextType {
  domains: Domain[];
  tasks: Task[];
  mainGoal: MainGoal | null;
  accomplishments: MainGoal[];
  loading: boolean;
  addTask: (domainId: string, data: { content: string; description?: string; startDate?: string; endDate?: string; isAllDay?: boolean; }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateMainGoal: (title: string, description: string) => Promise<void>;
  setupProject: (goal: { title: string; description: string }, domainTitles: string[]) => Promise<void>;
  updateDomain: (id: string, updates: Partial<Omit<Domain, 'id' | 'icon'>>) => Promise<void>;
  addDomain: (title: string, iconName: string) => Promise<void>;
  deleteDomain: (domainId: string) => Promise<void>;
  duplicateTask: (taskId: string) => Promise<void>;
  goalCompletedForModal: MainGoal | null;
  setGoalCompletedForModal: React.Dispatch<React.SetStateAction<MainGoal | null>>;
  completeAndResetProject: () => Promise<void>;
  calculateOverallProgress: (domainList: Domain[], taskList: Task[]) => number; // Exposer la fonction
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Fonctions de transformation
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

const transformMainGoal = (dbGoal: any): MainGoal => ({
  id: dbGoal.id,
  title: dbGoal.title,
  description: dbGoal.description || '',
  created_at: dbGoal.created_at,
  completed_at: dbGoal.completed_at,
  domain_count: dbGoal.domain_count, // Nouvelle propriété
  task_count: dbGoal.task_count,     // Nouvelle propriété
});

export const DataProvider = ({ children }: { ReactNode }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mainGoal, setMainGoal] = useState<MainGoal | null>(null);
  const [accomplishments, setAccomplishments] = useState<MainGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalCompletedForModal, setGoalCompletedForModal] = useState<MainGoal | null>(null);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: goalsData, error: goalsError } = await supabase.from('main_goals').select('*').eq('user_id', user.id);
      if (goalsError) throw goalsError;

      const activeGoalData = goalsData.find(g => !g.is_completed);
      const completedGoalsData = goalsData.filter(g => g.is_completed);

      setMainGoal(activeGoalData ? transformMainGoal(activeGoalData) : null);
      setAccomplishments(completedGoalsData.map(transformMainGoal));

      if (activeGoalData) {
        const { data: domainsData, error: domainsError } = await supabase.from('domains').select('*').eq('user_id', user.id);
        if (domainsError) throw domainsError;
        setDomains(domainsData.map(transformDomain));

        const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').eq('user_id', user.id);
        if (tasksError) throw tasksError;
        setTasks(tasksData.map(transformTask));
      } else {
        setDomains([]);
        setTasks([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      showError("common.errorLoadingData");
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
      setAccomplishments([]);
      setLoading(false);
    }
  }, [user]);

  const calculateDomainProgress = (domainId: string, taskList: Task[]) => {
    const domainTasks = taskList.filter((task) => task.domainId === domainId);
    if (domainTasks.length === 0) return 0;
    const completedTasks = domainTasks.filter((task) => task.columnId === "done").length;
    return Math.round((completedTasks / domainTasks.length) * 100);
  };

  const calculateOverallProgress = (domainList: Domain[], taskList: Task[]) => {
    if (domainList.length === 0) return 0;
    const totalProgress = domainList.reduce((sum, domain) => sum + calculateDomainProgress(domain.id, taskList), 0);
    return Math.round(totalProgress / domainList.length);
  };

  useEffect(() => {
    if (!mainGoal || loading) return;

    const progress = calculateOverallProgress(domains, tasks);

    if (progress === 100 && !hasShownCompletionModal) {
      setGoalCompletedForModal(mainGoal);
      setHasShownCompletionModal(true);
    } else if (progress < 100) {
      setHasShownCompletionModal(false);
    }
  }, [tasks, domains, mainGoal, loading, hasShownCompletionModal]);

  const setupProject = async (goal: { title: string; description: string }, domainTitles: string[]) => {
    if (!user) return;
    try {
      const { data: newGoal, error: goalError } = await supabase.from('main_goals').insert({ ...goal, user_id: user.id }).select().single();
      if (goalError) throw goalError;

      const newDomainsData = domainTitles.map((title, index) => ({
        user_id: user.id,
        title: title,
        icon_name: iconNames[index % iconNames.length],
        description: t("index.addDomainCardDescription"),
      }));
      const { data: newDomains, error: domainsError } = await supabase.from('domains').insert(newDomainsData).select();
      if (domainsError) throw domainsError;

      setMainGoal(transformMainGoal(newGoal));
      setDomains(newDomains.map(transformDomain));
      setHasShownCompletionModal(false);
      showSuccess("index.projectSetupSuccess");
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
      showError("index.projectSetupError");
    }
  };

  const updateMainGoal = async (title: string, description: string) => {
    if (!user || !mainGoal) return;
    const { data, error } = await supabase.from('main_goals').update({ title, description }).eq('id', mainGoal.id).select().single();
    if (error) {
      showError("index.goalUpdateError");
    } else if (data) {
      setMainGoal(transformMainGoal(data));
      showSuccess("index.goalUpdateSuccess");
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!user || !mainGoal) {
      console.warn("Tentative de mise à jour d'une tâche sans objectif principal actif. L'opération est ignorée.");
      return;
    }
    
    const updatePayload: { [key: string]: any } = {};

    if (updates.content !== undefined) updatePayload.content = updates.content;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.columnId !== undefined) updatePayload.column_id = updates.columnId;
    if (updates.domainId !== undefined) updatePayload.domain_id = updates.domainId;
    if (updates.startDate !== undefined) updatePayload.start_date = updates.startDate;
    if (updates.endDate !== undefined) updatePayload.end_date = updates.endDate;
    if (updates.isPriority !== undefined) updatePayload.is_priority = updates.isPriority;
    if (updates.isAllDay !== undefined) updatePayload.is_all_day = updates.isAllDay;

    if (Object.keys(updatePayload).length === 0) {
      console.warn("Aucune mise à jour valide fournie pour la tâche:", id);
      return;
    }

    const { data, error } = await supabase.from('tasks').update(updatePayload).eq('id', id).select().single();

    if (error) {
      console.error("Erreur Supabase lors de la mise à jour de la tâche:", error);
      showError("kanban.taskUpdateError");
    } else if (data) {
      setTasks(tasks.map(t => t.id === id ? transformTask(data) : t));
    }
  };

  const completeAndResetProject = async () => {
    if (!user || !mainGoal) return;
    try {
      // Compter les domaines et les tâches avant de les supprimer
      const currentDomainCount = domains.length;
      const currentTaskCount = tasks.length;

      const { data: updatedGoal, error: goalError } = await supabase
        .from('main_goals')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString(),
          domain_count: currentDomainCount, // Enregistrer le nombre de domaines
          task_count: currentTaskCount,     // Enregistrer le nombre de tâches
        })
        .eq('id', mainGoal.id)
        .select()
        .single();
      if (goalError) throw goalError;

      await supabase.from('tasks').delete().eq('user_id', user.id);
      await supabase.from('domains').delete().eq('user_id', user.id);

      setAccomplishments(prev => [...prev, transformMainGoal(updatedGoal)]);
      setTasks([]);
      setDomains([]);
      setMainGoal(null);
      setGoalCompletedForModal(null);
      setHasShownCompletionModal(false);
      showSuccess("completionModal.resetSuccess");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du projet:", error);
      showError("completionModal.resetError");
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
    }).select().single();
    if (error) {
      showError("kanban.taskAddError");
    } else if (data) {
      setTasks(prev => [...prev, transformTask(data)]);
      showSuccess("kanban.taskAddSuccess");
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      showError("kanban.taskDeleteError");
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
      showSuccess("kanban.taskDeleteSuccess");
    }
  };

  const duplicateTask = async (taskId: string) => {
    if (!user) return;
    try {
      const originalTask = tasks.find(t => t.id === taskId);
      if (!originalTask) {
        showError("kanban.taskDuplicateError");
        return;
      }

      const { data, error } = await supabase.from('tasks').insert({
        user_id: user.id,
        domain_id: originalTask.domainId,
        column_id: originalTask.columnId,
        content: `${t('common.copyPrefix')}${originalTask.content}`,
        description: originalTask.description,
        start_date: originalTask.startDate,
        end_date: originalTask.endDate,
        is_priority: originalTask.isPriority,
        is_all_day: originalTask.isAllDay,
      }).select().single();

      if (error) throw error;

      setTasks(prev => [...prev, transformTask(data)]);
      showSuccess("kanban.taskDuplicateSuccess");
    } catch (error) {
      console.error("Erreur lors de la duplication de la tâche:", error);
      showError("kanban.taskDuplicateError");
    }
  };

  const updateDomain = async (id: string, updates: Partial<Omit<Domain, 'id' | 'icon'>>) => {
    if (!user) return;
    const { data, error } = await supabase.from('domains').update({
      title: updates.title,
      description: updates.description,
      is_priority: updates.isPriority,
    }).eq('id', id).select().single();
    if (error) {
      showError("index.domainUpdateError");
    } else if (data) {
      setDomains(prev => prev.map(d => d.id === id ? transformDomain(data) : d));
    }
  };

  const addDomain = async (title: string, iconName: string) => {
    if (!user) return;
    if (domains.length >= 8) {
      showError("index.maxDomainsError");
      return;
    }
    const { data, error } = await supabase.from('domains').insert({
      user_id: user.id,
      title,
      icon_name: iconName,
      description: t("index.addDomainCardDescription"),
    }).select().single();
    if (error) {
      showError("index.domainAddError");
    } else if (data) {
      setDomains(prev => [...prev, transformDomain(data)]);
      showSuccess("index.domainAddSuccess");
    }
  };

  const deleteDomain = async (domainId: string) => {
    if (!user) return;
    await supabase.from('tasks').delete().eq('domain_id', domainId);
    const { error } = await supabase.from('domains').delete().eq('id', domainId);
    if (error) {
      showError("index.domainDeleteError");
    } else {
      setDomains(prev => prev.filter(d => d.id !== domainId));
      setTasks(prev => prev.filter(t => t.domainId !== domainId));
      showSuccess("index.domainDeleteSuccess");
    }
  };

  return (
    <DataContext.Provider value={{ domains, tasks, mainGoal, accomplishments, loading, addTask, updateTask, deleteTask, setTasks, updateMainGoal, setupProject, updateDomain, addDomain, deleteDomain, duplicateTask, goalCompletedForModal, setGoalCompletedForModal, completeAndResetProject, calculateOverallProgress }}>
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