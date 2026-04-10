import React, { useState } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { Trash2, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function History() {
  const { records, deleteRecord, addRecord } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('25');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const durationSecs = parseInt(duration) * 60;
    if (isNaN(durationSecs) || durationSecs <= 0) return;

    const startDateTime = new Date(`${date}T${time}`).getTime();
    
    addRecord({
      name: name.trim() || 'Manual Entry',
      mode: 'regular',
      duration: durationSecs,
      startTime: startDateTime,
      endTime: startDateTime + (durationSecs * 1000),
    });
    
    setShowAddForm(false);
    setName('');
    setDuration('25');
  };

  const sortedRecords = [...records].sort((a, b) => b.startTime - a.startTime);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">History</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddManual} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Task Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What did you do?"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Record
          </button>
        </form>
      )}

      <div className="space-y-3">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No history yet. Start focusing!
          </div>
        ) : (
          sortedRecords.map((record) => (
            <div key={record.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex justify-between items-center group">
              <div className="overflow-hidden">
                <h4 className="font-medium text-gray-800 truncate">{record.name}</h4>
                <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                  <span>{format(record.startTime, 'MMM d, HH:mm')}</span>
                  <span>•</span>
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider", 
                    record.mode === 'pomodoro' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {record.mode}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                <div className="text-right">
                  <div className="font-bold text-gray-700">{Math.round(record.duration / 60)}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">min</div>
                </div>
                <button
                  onClick={() => deleteRecord(record.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete record"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
