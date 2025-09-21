import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { CustomToolbar } from './calendar/CustomToolbar';
import { CustomEvent } from './calendar/CustomEvent';

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
          title: task.content,
          start: new Date(task.startDate!),
          end: new Date(task.endDate || task.startDate!),
          allDay: task.isAllDay ?? true,
          isDone: isDone,
          domainTitle: domain?.title,
        };
      });
  }, [tasks, domains]);

  const handleSelectEvent = (event: any) => {
    const task = tasks.find(t => t.id === event.id);
    if (task) {
      navigate(`/domain/${task.domainId}`);
    }
  };

  const components = useMemo(() => ({
    toolbar: (props: ToolbarProps) => <CustomToolbar {...props} />,
    event: (props: { event: any }) => <CustomEvent event={props.event} />,
  }), []);

  return (
    <div className="mt-8 h-[70vh] bg-card p-4 rounded-lg border calendar-container">
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
        components={components}
      />
    </div>
  );
};