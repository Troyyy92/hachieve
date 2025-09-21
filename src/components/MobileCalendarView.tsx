import { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from '@/contexts/DataContext';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export const MobileCalendarView = () => {
  const { tasks, domains } = useData();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

  const daysWithTasks = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach(task => {
      if (task.startDate) {
        dates.add(new Date(task.startDate).toDateString());
      }
    });
    return Array.from(dates).map(d => new Date(d));
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    if (!date) return [];
    return tasks
      .filter(task => task.startDate && isSameDay(new Date(task.startDate), date))
      .sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
      });
  }, [tasks, date]);

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      navigate(`/domain/${task.domainId}`);
    }
  };

  return (
    <div className="mt-8">
      <Card>
        <CardContent className="p-2 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0"
            locale={fr}
            modifiers={{
              withTask: daysWithTasks,
            }}
            modifiersClassNames={{
              withTask: 'day-with-task',
            }}
          />
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">
          Tâches du {date ? format(date, 'PPP', { locale: fr }) : 'jour sélectionné'}
        </h2>
        {selectedDayTasks.length > 0 ? (
          <div className="space-y-3">
            {selectedDayTasks.map(task => {
              const domain = domains.find(d => d.id === task.domainId);
              const isDone = task.columnId === 'done';
              return (
                <Card 
                  key={task.id} 
                  onClick={() => handleTaskClick(task.id)} 
                  className={cn(
                    "cursor-pointer transition-colors border-none",
                    task.isPriority ? "bg-[#ff93936b] hover:brightness-95" : "hover:bg-secondary",
                    isDone && "opacity-70"
                  )}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="text-xs text-muted-foreground pt-1 w-12 text-center">
                      {task.isAllDay ? (
                        <span>Journée</span>
                      ) : (
                        task.startDate && <span>{format(new Date(task.startDate), 'HH:mm')}</span>
                      )}
                    </div>
                    <div className="flex-1 border-l pl-3">
                      <p className={cn("font-medium", isDone && "line-through text-muted-foreground")}>
                        {task.content}
                      </p>
                      {domain && <Badge variant="outline" className="mt-1 font-normal">{domain.title}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">Aucune tâche planifiée pour ce jour.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};