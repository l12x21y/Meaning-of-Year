import React from 'react';
import { DayMeaning, Category } from '../types';
import { MONTH_NAMES, generateCalendarGrid } from '../utils/dateUtils';

interface MonthGridProps {
  monthIndex: number;
  events: Record<string, DayMeaning[]>;
  categories: Category[];
  onDayClick: (dateKey: string) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({ monthIndex, events, categories, onDayClick }) => {
  const days = generateCalendarGrid(monthIndex);
  const monthName = MONTH_NAMES[monthIndex];

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : 'bg-slate-400';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full break-inside-avoid mb-0">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{monthName}</h3>
        <span className="text-xs text-slate-400 font-mono">{days.length} Days</span>
      </div>
      
      {/* Standard 7-column calendar grid to maximize width per day */}
      <div className="grid grid-cols-7 gap-2 p-3">
        {days.map((dayObj) => {
          const dayEvents = events[dayObj.dateKey] || [];
          const hasEvents = dayEvents.length > 0;
          
          const containerClass = "bg-white hover:bg-slate-50 border-slate-100 text-slate-700";

          return (
            <button
              key={dayObj.dateKey}
              onClick={() => onDayClick(dayObj.dateKey)}
              className={`
                aspect-square rounded-lg border transition-all duration-200 relative overflow-hidden group text-left flex flex-col p-1
                ${containerClass}
              `}
            >
              <div className="flex justify-between items-start w-full mb-0.5 shrink-0">
                <span className={`text-[10px] sm:text-xs font-bold ${hasEvents ? 'text-slate-600' : 'text-slate-300'}`}>
                  {dayObj.day}
                </span>
              </div>

              {/* Events Stack */}
              <div className="flex flex-col gap-0.5 mt-auto w-full overflow-hidden">
                 {/* Display up to 3 events clearly, then +more */}
                 {dayEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className={`
                      w-full rounded-[2px] px-1 py-[1px] shadow-sm shrink-0
                      ${getCategoryColor(event.categoryId)}
                    `}>
                       <div className="flex items-center gap-1">
                          {/* Hide year on very small items to save space for title */}
                          <span className="hidden sm:inline text-[7px] font-bold text-white/90 leading-none shrink-0">{event.year}</span>
                          <span className="text-[7px] sm:text-[8px] font-medium text-white leading-none truncate block">{event.title}</span>
                       </div>
                    </div>
                 ))}
                 {dayEvents.length > 3 && (
                    <div className="text-[8px] text-slate-400 text-center font-medium leading-none">
                       +{dayEvents.length - 3}
                    </div>
                 )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthGrid;