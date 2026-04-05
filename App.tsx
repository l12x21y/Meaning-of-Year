import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import MonthGrid from './components/MonthGrid';
import DayModal from './components/DayModal';
import { DayMeaning, Category, DEFAULT_CATEGORIES } from './types';

const App: React.FC = () => {
  // Events are now stored as an array of meanings per date key
  const [events, setEvents] = useState<Record<string, DayMeaning[]>>({});
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Load from local storage on mount with migration support
  useEffect(() => {
    const savedEvents = localStorage.getItem('year-of-meaning-events-perpetual');
    const savedCategories = localStorage.getItem('year-of-meaning-categories');

    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        const migrated: Record<string, DayMeaning[]> = {};
        
        // Migrate old format (Record<string, DayMeaning>) to new (Record<string, DayMeaning[]>)
        Object.keys(parsed).forEach(key => {
          const val = parsed[key];
          if (Array.isArray(val)) {
            migrated[key] = val;
          } else {
            migrated[key] = [val];
          }
        });
        setEvents(migrated);
      } catch (e) {
        console.error("Failed to load events", e);
      }
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    }
  }, []);

  // Save to local storage on update
  useEffect(() => {
    localStorage.setItem('year-of-meaning-events-perpetual', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('year-of-meaning-categories', JSON.stringify(categories));
  }, [categories]);

  const handleDayClick = (dateKey: string) => {
    setSelectedDateKey(dateKey);
  };

  const handleSaveEvent = (meaning: DayMeaning) => {
    setEvents(prev => {
      const dayEvents = prev[meaning.date] || [];
      const index = dayEvents.findIndex(e => e.id === meaning.id);
      
      let newDayEvents;
      if (index >= 0) {
        // Update existing
        newDayEvents = [...dayEvents];
        newDayEvents[index] = meaning;
      } else {
        // Add new
        newDayEvents = [...dayEvents, meaning];
      }

      // Sort by year descending (newest first)
      newDayEvents.sort((a, b) => b.year - a.year);

      return {
        ...prev,
        [meaning.date]: newDayEvents
      };
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (!selectedDateKey) return;
    setEvents(prev => {
      const dayEvents = prev[selectedDateKey] || [];
      const newDayEvents = dayEvents.filter(e => e.id !== id);
      
      const newEvents = { ...prev };
      if (newDayEvents.length === 0) {
        delete newEvents[selectedDateKey];
      } else {
        newEvents[selectedDateKey] = newDayEvents;
      }
      return newEvents;
    });
  };

  const handleAddCategory = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory]);
  };

  // Count total individual memories
  // Explicitly type accumulator and current value in reduce to avoid 'unknown' type error
  const filledCount = Object.values(events).reduce((acc: number, curr: DayMeaning[]) => acc + curr.length, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Navigation / Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <CalendarIcon size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              My Life in Days
            </h1>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-indigo-600">{filledCount}</span>
              <span>memories collected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto w-full">
        {/* Modified Grid Cols: 
            md: 2 columns (tablets/small laptops)
            xl: 3 columns (desktops)
            This ensures months are wide enough to display events clearly.
        */}
        <div className="masonry-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 12 }).map((_, index) => (
            <MonthGrid
              key={index}
              monthIndex={index}
              events={events}
              categories={categories}
              onDayClick={handleDayClick}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
        <p>A perpetual calendar for your most meaningful moments.</p>
      </footer>

      {/* Modal */}
      {selectedDateKey && (
        <DayModal
          dateKey={selectedDateKey}
          dayEvents={events[selectedDateKey] || []}
          categories={categories}
          onClose={() => setSelectedDateKey(null)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onAddCategory={handleAddCategory}
        />
      )}
    </div>
  );
};

export default App;