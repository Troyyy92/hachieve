import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { isWithinInterval, startOfDay, endOfDay, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CalendarView = () => {
  const { tasks, domains } = useData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const tasksWithDates = useMemo(() => {
    return tasks.filter(task => task.startDate);
  }, [tasks]);

  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return tasksWithDates
      .filter(task => {
        const start = startOfDay(parseISO(task.startDate!));
        const end = task.endDate ? endOfDay(parseISO(task.endDate)) : startOfDay(start);
        return isWithinInterval(startOfDay(selectedDate), { start, end });
      })
      .sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0));
  }, [tasksWithDates, selectedDate]);

  const modifiers = {
    hasTask: (date: Date) => {
      return tasksWithDates.some(task => {
        const start = startOfDay(parseISO(task.startDate!));
        const end = task.endDate ? endOfDay(parseISO(task.endDate)) : startOfDay(start);
        return isWithinInterval(date, { start, end });
      });
    }
  };

  const getDomainForTask = (domainId: string) => {
    return domains.find(d => d.id === domainId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <div className="md:col-span-1 flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          locale={fr}
          modifiers={modifiers}
          modifiersClassNames={{
            hasTask: 'day-with-task',
          }}
        />
      </div>
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">
          Tâches pour le {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: fr }) : '...'}
        </h2>
        <div className="space-y-4">
          {tasksForSelectedDay.length > 0 ? (
            tasksForSelectedDay.map(task => {
              const domain = getDomainForTask(task.domainId);
              return (
                <Card key={task.id} className={cn(task.isPriority && "bg-cyan-50 border-cyan-200")}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{task.content}</CardTitle>
                      {task.isPriority && <Star className="h-5 w-5 text-yellow-500 fill-yellow-400 flex-shrink-0" />}
                    </div>
                    {domain && (
                      <CardDescription>
                        Domaine : 
                        <Link to={`/domain/${domain.id}`} className="ml-1 text-primary hover:underline">
                          {domain.title}
                        </Link>
                      </CardDescription>
                    )}
                  </CardHeader>
                  {task.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })
          ) : (
            <p className="text-muted-foreground">Aucune tâche planifiée pour ce jour.</p>
          )}
        </div>
      </div>
    </div>
  );
};