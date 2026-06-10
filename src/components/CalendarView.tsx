import { useState } from 'react';
import { Booking, Employee, Equipment } from '../types';
import { ChevronLeft, ChevronRight, Calendar, List, Clock, User, Package, Check, Clipboard } from 'lucide-react';

interface CalendarViewProps {
  bookings: Booking[];
  employees: Employee[];
  equipment: Equipment[];
  onSelectBooking: (booking: Booking) => void;
  onSelectDate: (dateStr: string) => void;
  selectedEmployeeFilter: string | null;
  selectedEquipmentFilter: string | null;
}

export default function CalendarView({
  bookings,
  employees,
  equipment,
  onSelectBooking,
  onSelectDate,
  selectedEmployeeFilter,
  selectedEquipmentFilter
}: CalendarViewProps) {
  // Current month of calendar display
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June

  // Added View Mode state (grid vs compact-agenda, defaults to agenda on small phones dynamically)
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const DAYS_OF_WEEK_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAYS_OF_WEEK_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Current system local time is June 8, 2026
  const todayStr = '2026-06-08';

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    }
  };

  const jumpToToday = () => {
    setCurrentMonth(5); // June
    setCurrentYear(2026);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const totalGridCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;
  const gridCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

  for (let i = startOffset - 1; i >= 0; i--) {
    const dayVal = daysInPrevMonth - i;
    const moStr = String(prevMonth + 1).padStart(2, '0');
    gridCells.push({
      dateStr: `${prevMonthYear}-${moStr}-${String(dayVal).padStart(2, '0')}`,
      dayNum: dayVal,
      isCurrentMonth: false
    });
  }

  const curMoStr = String(currentMonth + 1).padStart(2, '0');
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push({
      dateStr: `${currentYear}-${curMoStr}-${String(d).padStart(2, '0')}`,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  const cellsLeft = totalGridCells - gridCells.length;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMoStr = String(nextMonth + 1).padStart(2, '0');
  for (let n = 1; n <= cellsLeft; n++) {
    gridCells.push({
      dateStr: `${nextMonthYear}-${nextMoStr}-${String(n).padStart(2, '0')}`,
      dayNum: n,
      isCurrentMonth: false
    });
  }

  const getBookingsForDate = (dateStr: string) => {
    return bookings.filter((b) => b.date === dateStr);
  };

  const doesBookingMatchFilter = (booking: Booking) => {
    if (selectedEmployeeFilter && !booking.employeeIds.includes(selectedEmployeeFilter)) {
      return false;
    }
    if (selectedEquipmentFilter && !booking.equipmentIds.includes(selectedEquipmentFilter)) {
      return false;
    }
    return true;
  };

  // Compile active month's bookings filtered and sorted for the Agenda tab
  const activeAgendaBookings = bookings
    .filter((b) => {
      // Filter for current month view
      const parts = b.date.split('-');
      const bYear = parseInt(parts[0]);
      const bMonth = parseInt(parts[1]) - 1; // 0-indexed
      const inCurrentViewMonth = bYear === currentYear && bMonth === currentMonth;
      return inCurrentViewMonth && doesBookingMatchFilter(b);
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  // Count active matched bookings for badge display
  const matchedBookingsCount = bookings.filter((b) => {
    const parts = b.date.split('-');
    const bYear = parseInt(parts[0]);
    const bMonth = parseInt(parts[1]) - 1;
    return bYear === currentYear && bMonth === currentMonth && doesBookingMatchFilter(b);
  }).length;

  return (
    <div className="bg-[#FDFCFB] border border-brand-charcoal/10 rounded-none overflow-hidden shadow-sm flex flex-col">
      
      {/* Calendar Top Controls Header (Tauri & Mobile Optimized) */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3.5 p-4 md:p-5 border-b border-brand-charcoal/10 bg-brand-linen shrink-0">
        
        {/* Title and Badge Line */}
        <div className="flex items-center justify-between md:justify-start gap-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-serif font-bold italic text-brand-charcoal">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <span className="font-mono text-[9px] md:text-[10px] bg-brand-rust text-white font-bold uppercase tracking-wider px-2 py-0.5 md:py-1 select-none">
              {matchedBookingsCount} Viewable
            </span>
          </div>
          
          {/* Mobile direct navigation */}
          <div className="flex items-center gap-1 md:hidden bg-white border border-brand-charcoal/10 p-0.5 rounded-none">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 text-brand-charcoal hover:bg-neutral-100 min-h-[36px] min-w-[36px] flex items-center justify-center transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 text-brand-charcoal hover:bg-neutral-100 min-h-[36px] min-w-[36px] flex items-center justify-center transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher and Jump Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          
          {/* View Toggles (Grid vs. List) */}
          <div className="flex items-center bg-white border border-brand-charcoal/10 p-1 select-none">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-3 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer min-h-[32px] rounded-none ${
                viewMode === 'grid' 
                  ? 'bg-brand-charcoal text-white' 
                  : 'text-neutral-500 hover:text-brand-charcoal'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1.5 px-3 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer min-h-[32px] rounded-none ${
                viewMode === 'agenda' 
                  ? 'bg-brand-charcoal text-white' 
                  : 'text-neutral-500 hover:text-brand-charcoal'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Desktop Navigation & Today */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-brand-charcoal bg-white border border-brand-charcoal/15 hover:border-brand-charcoal/30 transition shadow-xs cursor-pointer min-h-[34px] rounded-none"
            >
              Today
            </button>
            
            <div className="hidden md:flex items-center gap-1 bg-white border border-brand-charcoal/10 p-0.5">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 px-2.5 hover:bg-brand-linen text-brand-charcoal transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-[1px] h-4 bg-brand-charcoal/15" />
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 px-2.5 hover:bg-brand-linen text-brand-charcoal transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* RENDER MODE: MONTH GRID */}
      {viewMode === 'grid' ? (
        <div className="flex flex-col flex-1">
          {/* Weekday Titles Bar */}
          <div className="grid grid-cols-7 border-b border-brand-charcoal/10 bg-[#F5F2EF]/50 text-center py-2 shrink-0">
            {DAYS_OF_WEEK_FULL.map((day, idx) => (
              <span
                key={idx}
                className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-brand-charcoal/75"
              >
                {/* On small screens use short single-character weekday title */}
                <span className="hidden xs:inline">{day}</span>
                <span className="inline xs:hidden">{DAYS_OF_WEEK_SHORT[idx]}</span>
              </span>
            ))}
          </div>

          {/* Calendar Dates Grid */}
          <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr min-h-[340px] md:min-h-[580px] bg-white divide-x divide-y divide-brand-charcoal/5 flex-1 select-none">
            {gridCells.map((cell, idx) => {
              const dayBookings = getBookingsForDate(cell.dateStr);
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  className={`p-1 md:p-1.5 flex flex-col justify-between group transition-all duration-150 border-t border-l border-brand-charcoal/5 relative min-h-[64px] xs:min-h-[80px] md:min-h-[110px] ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-brand-linen/10 opacity-40'
                  } hover:bg-brand-linen/35 cursor-pointer`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      onSelectDate(cell.dateStr);
                    }
                  }}
                >
                  {/* Day Header Slot */}
                  <div className="flex items-center justify-between pointer-events-none select-none">
                    <span
                      className={`text-[10px] md:text-xs font-bold leading-none flex items-center justify-center w-5 h-5 md:w-5.5 md:h-5.5 rounded-none ${
                        isToday
                          ? 'bg-brand-rust text-white font-extrabold shadow-sm'
                          : 'text-brand-charcoal'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Micro Plus Indicator on hover */}
                    {cell.isCurrentMonth && (
                      <span className="hidden md:inline text-[9px] font-extrabold text-brand-rust opacity-0 group-hover:opacity-100 transition duration-150 pr-1 select-none">
                        + BOOK
                      </span>
                    )}
                  </div>

                  {/* Day Bookings chips */}
                  <div className="mt-1 space-y-1 flex-1 flex flex-col justify-end max-h-[140px] overflow-y-auto pr-0.5 scrollbar-thin">
                    {dayBookings.map((b) => {
                      const isMatch = doesBookingMatchFilter(b);
                      
                      // Find color code
                      const employeeAssigned = b.employeeIds.length > 0 
                        ? employees.find(e => e.id === b.employeeIds[0])?.avatarColor || '#1A1817'
                        : '#1A1817';

                      const isCancelled = b.status === 'cancelled';
                      const isCompleted = b.status === 'completed';

                      return (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBooking(b);
                          }}
                          title={`${b.title} [${b.startTime} - ${b.endTime}]`}
                          className={`text-[8px] md:text-[10px] p-1 text-left transition border shadow-2xs select-none truncate rounded-none leading-none min-h-[18px] flex flex-col justify-center ${
                            isCancelled ? 'line-through opacity-30 bg-neutral-150' : ''
                          } ${
                            isMatch
                              ? 'font-bold opacity-100 hover:border-brand-rust'
                              : 'opacity-20 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: isCancelled ? '#F3F4F6' : `${employeeAssigned}06`,
                            borderColor: isCancelled ? '#E5E7EB' : `${employeeAssigned}20`,
                            borderLeftWidth: '2.5px',
                            borderLeftColor: isCancelled ? '#9CA3AF' : employeeAssigned,
                            color: isCancelled ? '#6B7280' : '#1A1817'
                          }}
                        >
                          <div className="hidden sm:flex items-center justify-between font-mono text-[7px] md:text-[8px] opacity-60 font-semibold mb-0.5">
                            <span>{b.startTime}</span>
                            {isCompleted && <span className="text-emerald-600 font-bold font-sans">✓</span>}
                          </div>
                          <p className="font-sans leading-tight tracking-tight truncate select-none">{b.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* RENDER MODE: COMPACT LIST SWIPABLE AGENDA (Ideal for mobile phone screens) */
        <div className="flex-1 bg-[#FAF9F6]/50 min-h-[380px] p-4 space-y-3.5 max-h-[600px] overflow-y-auto">
          {activeAgendaBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-brand-charcoal/10 rounded-none bg-white">
              <Clipboard className="w-8 h-8 text-neutral-300 mb-2.5" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">No scheduled sessions</p>
              <p className="text-[11px] text-neutral-450 mt-1 max-w-sm">No reservations match the active workspace filter parameters on this selected calendar period.</p>
              <button
                onClick={() => onSelectDate(todayStr)}
                className="mt-4 px-4 py-2 bg-brand-charcoal text-white font-extrabold text-[10px] uppercase tracking-wider hover:bg-neutral-800 transition rounded-none"
              >
                + Book New For Today
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-bold tracking-wider font-mono text-neutral-450 uppercase mb-1">
                Active Agenda Events For {MONTHS[currentMonth]} {currentYear}
              </p>
              
              {activeAgendaBookings.map((b) => {
                const colorHex = b.employeeIds.length > 0
                  ? employees.find(e => e.id === b.employeeIds[0])?.avatarColor || '#C54B2C'
                  : '#C54B2C';

                const isCancelled = b.status === 'cancelled';
                const isCompleted = b.status === 'completed';

                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectBooking(b)}
                    className={`bg-white border p-4 shadow-2xs hover:border-brand-rust transition cursor-pointer select-none active:bg-neutral-50 relative flex flex-col justify-between rounded-none ${
                      isCancelled ? 'opacity-50' : ''
                    }`}
                    style={{
                      borderLeftWidth: '5px',
                      borderLeftColor: colorHex
                    }}
                  >
                    {/* Badge references */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase">
                        Ref: {b.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-bold font-mono uppercase px-1.5 py-0.5 ${
                          isCancelled ? 'bg-red-50 text-red-650 border border-red-150' :
                          isCompleted ? 'bg-emerald-50 text-emerald-650 border border-emerald-150' :
                          'bg-brand-linen text-brand-charcoal border border-brand-charcoal/15'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>

                    {/* Main title details */}
                    <div>
                      <h4 className={`text-sm font-bold text-brand-charcoal ${isCancelled ? 'line-through text-neutral-450' : ''}`}>
                        {b.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-neutral-450 font-medium">
                        <span className="flex items-center gap-1 bg-brand-linen px-2 py-0.5 rounded-none font-bold text-brand-charcoal shrink-0">
                          📅 {b.date}
                        </span>
                        <span className="flex items-center gap-1 bg-brand-linen px-2 py-0.5 rounded-none font-sans font-bold text-brand-charcoal">
                          <Clock className="w-3.5 h-3.5 text-brand-rust shrink-0 inline" /> {b.startTime} - {b.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Client & Assigned Resources Block */}
                    <div className="mt-3.5 pt-3 border-t border-brand-charcoal/5 flex flex-col gap-2 font-sans text-xs">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block mb-0.5">Contact Client</span>
                        <p className="text-[11px] font-bold text-brand-charcoal">{b.clientName} {b.clientPhone && <span className="font-mono font-normal text-neutral-400 pl-1">({b.clientPhone})</span>}</p>
                      </div>

                      {/* Display Crews and equipment assigned */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block mb-1">
                            Photographers ({b.employeeIds.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {b.employeeIds.map(id => {
                              const emp = employees.find(e => e.id === id);
                              return (
                                <span 
                                  key={id} 
                                  className="text-[9.5px] px-1.5 py-0.5 bg-brand-linen/80 text-brand-charcoal font-bold inline-flex items-center gap-1"
                                >
                                  <span 
                                    className="w-1.5 h-1.5 rounded-full inline-block" 
                                    style={{ backgroundColor: emp?.avatarColor }}
                                  />
                                  {emp?.name.split(' ')[0]}
                                </span>
                              );
                            })}
                            {b.employeeIds.length === 0 && (
                              <span className="text-[9px] text-neutral-400 italic">No operators</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block mb-1">
                            Equipment Reserved ({b.equipmentIds.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {b.equipmentIds.map(id => (
                              <span 
                                key={id} 
                                className="text-[9.5px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 font-bold max-w-[90px] truncate"
                                title={equipment.find(eq => eq.id === id)?.name}
                              >
                                {equipment.find(eq => eq.id === id)?.name.split(' (')[0]}
                              </span>
                            ))}
                            {b.equipmentIds.length === 0 && (
                              <span className="text-[9px] text-neutral-400 italic">Dry-hire / No gears</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                    {b.notes && (
                      <p className="mt-3.5 text-[10px] text-neutral-500 bg-neutral-50/50 p-2 border border-dashed border-neutral-100 italic truncate max-w-full">
                        "{b.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Touch Legenda indicator at bottom */}
      <div className="border-t border-brand-charcoal/10 bg-brand-linen p-3 px-4.5 flex flex-col xs:flex-row items-center justify-between text-[10.5px] text-neutral-450 gap-2 shrink-0">
        <span className="font-medium">👆 Touch any date block space to launch scheduling sheet.</span>
        <span className="font-mono uppercase text-[9px] font-bold text-brand-rust">Month Range: {MONTHS[currentMonth]} 1 - {daysInMonth}</span>
      </div>

    </div>
  );
}
