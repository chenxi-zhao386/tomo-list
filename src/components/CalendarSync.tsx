import React, { useState, useEffect } from 'react';
import { useStore, TaskPriority } from '../store';
import { Calendar as CalendarIcon, RefreshCw, Plus, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export function CalendarSync() {
  const { accessToken, addRecord } = useStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('30');
  const [newTaskDate, setNewTaskDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTaskTime, setNewTaskTime] = useState(format(new Date(), 'HH:mm'));

  const fetchEvents = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const timeMin = new Date().toISOString();
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 7); // Next 7 days
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax.toISOString()}&orderBy=startTime&singleEvents=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      
      const data = await response.json();
      setEvents(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchEvents();
    }
  }, [accessToken]);

  const importAsTask = (event: CalendarEvent) => {
    if (!event.start.dateTime || !event.end.dateTime) return;
    
    const startTime = new Date(event.start.dateTime).getTime();
    const endTime = new Date(event.end.dateTime).getTime();
    const duration = Math.floor((endTime - startTime) / 1000);
    
    addRecord({
      name: event.summary || 'Calendar Event',
      mode: 'regular',
      duration,
      startTime,
      endTime,
      priority: 'Medium'
    });
    
    // Remove from list after import
    setEvents(events.filter(e => e.id !== event.id));
  };

  const scheduleTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const startDateTime = new Date(`${newTaskDate}T${newTaskTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(newTaskDuration) * 60000);
      
      const event = {
        summary: `[Focus] ${newTaskName}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        description: 'Scheduled via Focus Time Manager',
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to schedule event');
      }

      setShowScheduleForm(false);
      setNewTaskName('');
      fetchEvents(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <CalendarIcon size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Google Calendar</h3>
        <p className="text-sm text-gray-500">Sign in with Google to view and import your upcoming events.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Calendar</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
          >
            {showScheduleForm ? <Plus size={18} className="rotate-45" /> : <Plus size={18} />}
          </button>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {showScheduleForm && (
        <form onSubmit={scheduleTask} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
          <h3 className="font-semibold text-sm text-gray-700">Block Time on Calendar</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Task Name</label>
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="What to focus on?"
              required
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
              <input
                type="number"
                min="1"
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
            <input
              type="time"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Task'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {events.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No upcoming events found in the next 7 days.
          </div>
        ) : (
          events.map(event => {
            const isAllDay = !event.start.dateTime;
            const startDate = isAllDay ? parseISO(event.start.date!) : parseISO(event.start.dateTime!);
            
            return (
              <div key={event.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex justify-between items-center group">
                <div className="overflow-hidden pr-4">
                  <h4 className="font-medium text-gray-800 truncate">{event.summary || '(No title)'}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                    <Clock size={12} />
                    <span>
                      {isAllDay ? 'All Day' : format(startDate, 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
                {!isAllDay && (
                  <button
                    onClick={() => importAsTask(event)}
                    className="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Import</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
