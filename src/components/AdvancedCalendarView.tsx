import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-breakpoint';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const eventStyleGetter = (event: any) => {
  const style = {
    backgroundColor: event.isDone ? '#d1d5db' : '#3b82f6', // gray for done, blue for active
    borderRadius: '5px',
    opacity: 0.8,
    color: 'white',
    border: '0px',
    display: 'block',
  };
  return {
    style: style,
  };
};

export const AdvancedCalendarView = () => {
  const { tasks, domains } = useData();
  const navigate = useNavigate();
  const isMobile = useBreakpoint(414);

  const events = useMemo(() => {
    return tasks
      .filter(task => task.startDate)
      .map(task => {
        const domain = domains.find(d => d.id === task.domainId);
        const isDone = task.columnId === 'done';
        return {
          id: task.id,
          title: (
            <div className={cn(isDone && "line-through")}>
              <p className="font-semibold">{task.content}</p>
              {domain && <p className="text-xs italic">{domain.title}</p>}
            </div>
          ),
          start: new Date(task.startDate!),
          end: new Date(task.endDate || task.startDate!),
          allDay: task.isAllDay ?? true,
          isDone: isDone,
        };
      });
  }, [tasks, domains]);

  const handleSelectEvent = (event: any) => {
    const task = tasks.find(t => t.id === event.id);
    if (task) {
      navigate(`/domain/${task.domainId}`);
    }
  };

  return (
    <div className="mt-8 h-[70vh] bg-card p-4 rounded-lg border">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={isMobile ? Views.DAY : Views.WEEK}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        culture='fr'
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
          date: "Date",
          time: "Heure",
          event: "Événement",
          noEventsInRange: "Aucun événement dans cette période.",
          showMore: total => `+ ${total} de plus`
        }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};