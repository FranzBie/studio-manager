import { useState, useEffect } from 'react';
import { Booking, Employee, Equipment } from './types';
import { DEFAULT_BOOKINGS, DEFAULT_EMPLOYEES, DEFAULT_EQUIPMENT } from './mockData';
import CalendarView from './components/CalendarView';
import RosterPanel from './components/RosterPanel';
import EquipmentPanel from './components/EquipmentPanel';
import BookingModal from './components/BookingModal';
import { isTauri, sendDesktopNotification } from './tauriHelper';
import { 
  Plus, RefreshCw, Calendar, Users, Package, AlertTriangle, 
  HelpCircle, Clock, CheckCircle, ChevronRight, FileText, MonitorCheck
} from 'lucide-react';

export default function App() {
  // 1. Initial Local State Core
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('studio_calendar_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_BOOKINGS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('studio_calendar_employees');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_EMPLOYEES;
  });

  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('studio_calendar_equipment');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_EQUIPMENT;
  });

  // 2. Sidebar Filters
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string | null>(null);
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState<string | null>(null);

  // 3. Modal Views
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);

  // 4. Notifications/Tips
  const [notification, setNotification] = useState<string | null>(
    isTauri() 
      ? '🚀 Running with Tauri Native Shell! Desktop notifications have been enabled.'
      : 'Select a crew photographer or physical gear item on the sidebar to filter scheduled bookings!'
  );

  // 5. Responsive Active Mobile Tab state (calendar, roster, or equipment)
  const [activeMobileTab, setActiveMobileTab] = useState<'calendar' | 'roster' | 'equipment'>('calendar');

  // Synchronize state changes to localStorage
  useEffect(() => {
    localStorage.setItem('studio_calendar_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('studio_calendar_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('studio_calendar_equipment', JSON.stringify(equipment));
  }, [equipment]);

  // Timed dismiss for notification alerts
  useEffect(() => {
    if (notification && !notification.includes('Tauri')) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 6. Booking Handlers
  const handleSaveBooking = (booking: Booking) => {
    const index = bookings.findIndex((b) => b.id === booking.id);
    if (index >= 0) {
      // Update existing booking
      const updated = [...bookings];
      updated[index] = booking;
      setBookings(updated);
      const text = `Session "${booking.title}" rewritten and synchronized.`;
      setNotification(`Success: ${text}`);
      sendDesktopNotification('Studio Reservation Saved', text);
    } else {
      // Create new booking
      setBookings((prev) => [booking, ...prev]);
      const text = `New session "${booking.title}" booked on ${booking.date}.`;
      setNotification(`Success: ${text}`);
      sendDesktopNotification('Session Scheduled Successfully', text);
    }
    setIsModalOpen(false);
    setSelectedBooking(null);
    setPreselectedDate(null);
  };

  const handleDeleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setIsModalOpen(false);
    setSelectedBooking(null);
    setPreselectedDate(null);
    const text = 'Reservation has been successfully deleted from active rosters.';
    setNotification(text);
    sendDesktopNotification('Reservation Cancelled', text);
  };

  // 7. Roster Handlers
  const handleToggleEmployeeActive = (empId: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const nextState = !emp.isActive;
        const alertText = nextState
          ? `${emp.name} is now marked back in the studio.`
          : `${emp.name} has been set to temporary away/holiday leave.`;
        setNotification(alertText);
        sendDesktopNotification('Roster Status Modified', alertText);
        return { ...emp, isActive: nextState };
      })
    );
  };

  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const randomId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    setEmployees((prev) => [...prev, { ...newEmp, id: randomId }]);
    const alertText = `Added ${newEmp.name} (${newEmp.role}) to rosters.`;
    setNotification(`Success: ${alertText}`);
    sendDesktopNotification('Personnel Enrolled', alertText);
  };

  // 8. Equipment Handlers
  const handleToggleEquipmentAvailable = (eqId: string) => {
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== eqId) return eq;
        const nextState = !eq.isAvailable;
        const alertText = nextState
          ? `"${eq.name}" is recorded in stable availability storage.`
          : `"${eq.name}" has been routed for maintenance repair.`;
        setNotification(alertText);
        sendDesktopNotification('Gear Inventory Updated', alertText);
        return { ...eq, isAvailable: nextState };
      })
    );
  };

  const handleAddEquipment = (newEq: Omit<Equipment, 'id'>) => {
    const randomId = `EQ-${Math.floor(100 + Math.random() * 910)}`;
    setEquipment((prev) => [...prev, { ...newEq, id: randomId }]);
    const alertText = `Added "${newEq.name}" to inventory.`;
    setNotification(`Success: ${alertText}`);
    sendDesktopNotification('Asset Logged', alertText);
  };

  // 9. Database Controls
  const handleResetDatabase = () => {
    if (confirm('Revert all schedule configurations, rosters, and gears to sample workspace datasets?')) {
      setBookings(DEFAULT_BOOKINGS);
      setEmployees(DEFAULT_EMPLOYEES);
      setEquipment(DEFAULT_EQUIPMENT);
      setSelectedEmployeeFilter(null);
      setSelectedEquipmentFilter(null);
      setNotification('Studio scheduler dataset reverted back to template settings.');
      sendDesktopNotification('Database Reverted', 'Rosters and configurations synchronized baseline template.');
    }
  };

  // 10. Conflict metrics calculator
  const getConflictMetrics = () => {
    let clashCount = 0;
    const activeBookings = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed');

    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    for (let i = 0; i < activeBookings.length; i++) {
      const b1 = activeBookings[i];
      const s1 = parseTime(b1.startTime);
      const e1 = parseTime(b1.endTime);

      for (let j = i + 1; j < activeBookings.length; j++) {
        const b2 = activeBookings[j];
        if (b1.date !== b2.date) continue;

        const s2 = parseTime(b2.startTime);
        const e2 = parseTime(b2.endTime);

        const overlaps = s1 < e2 && s2 < e1;
        if (!overlaps) continue;

        // Check shared crew / hardware overlaps
        const sharedEmp = b1.employeeIds.some((id) => b2.employeeIds.includes(id));
        const sharedEq = b1.equipmentIds.some((id) => b2.equipmentIds.includes(id));

        if (sharedEmp || sharedEq) {
          clashCount++;
        }
      }
    }
    return clashCount;
  };

  const conflictsCount = getConflictMetrics();

  const handleOpenBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setPreselectedDate(null);
    setIsModalOpen(true);
  };

  const handleOpenNewDateBooking = (dateStr: string) => {
    setSelectedBooking(null);
    setPreselectedDate(dateStr);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans antialiased pb-24 text-sm">
      
      {/* 2026 Studio Master Control Banner */}
      <header className="bg-[#1A1A1A] text-white shadow-xl sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Studio Name Branding Block */}
          <div className="flex items-center gap-3">
            <div className="bg-brand-rust px-3 py-2 border border-brand-rust/20 shadow-inner flex items-center justify-center shrink-0">
              <span className="font-serif font-bold italic text-base text-white tracking-widest select-none leading-none">
                S★S
              </span>
            </div>
            <div>
              <h1 className="text-sm sm:text-md font-serif font-bold tracking-tight text-white flex items-center gap-2 leading-none uppercase">
                Studio Scheduler & Resource Manager
              </h1>
              <p className="text-[10px] text-neutral-450 uppercase tracking-widest font-mono mt-1.5 select-none leading-none flex items-center gap-1">
                Interactive Booking Cal • Staff Rosters • Gear Operations
                {isTauri() && (
                  <span className="text-emerald-400 font-bold ml-1 flex items-center gap-0.5">
                    <MonitorCheck className="w-3 h-3" /> Tauri Native Mode
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid in Header */}
          <div className="flex flex-wrap items-center gap-2 bg-brand-charcoal border border-white/10 p-1.5 text-xs select-none">
            <div className="px-2.5 py-1 text-center border-r border-white/10 shrink-0">
              <span className="block text-[8px] uppercase tracking-wider text-neutral-450 font-bold">Allocations info</span>
              <span className="block font-mono text-[10.5px] font-bold text-brand-rust mt-0.5">
                {bookings.filter(b => b.status === 'scheduled').length} Scheduled Sessions
              </span>
            </div>

            <div className="px-2.5 py-1 text-center border-r border-white/10 shrink-0">
              <span className="block text-[8px] uppercase tracking-wider text-neutral-450 font-bold">Roster count</span>
              <span className="block font-mono text-[10.5px] font-semibold text-white mt-0.5">
                {employees.filter(e => e.isActive).length} Available Staff
              </span>
            </div>

            <div className="px-2.5 py-1 text-center flex items-center gap-1.5 shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${conflictsCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
              <div className="text-left">
                <span className="block text-[8px] uppercase tracking-wider text-neutral-450 font-bold">Collision Monitor</span>
                <span className="block font-mono text-[10.5px] font-bold text-white leading-none mt-0.5">
                  {conflictsCount === 0 ? '0 Conflicts' : `${conflictsCount} Overlaps`}
                </span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Grid Layout Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 md:mt-8 space-y-6">
        
        {/* Dynamic Studio Tip/Action Toast Bar */}
        {notification && (
          <div id="tip-banner" className="bg-[#1A1A1A]/95 backdrop-blur-xs text-[#FAF9F6] px-5 py-4 flex items-start justify-between gap-4 shadow-lg border-l-4 border-brand-rust animate-fade-in text-xs font-medium">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-brand-rust mt-0.5 shrink-0" />
              <div>
                <p className="font-bold uppercase text-[9px] tracking-wider text-brand-rust mb-0.5">Studio System Alert</p>
                <p className="text-neutral-200 text-xs leading-normal font-medium">{notification}</p>
              </div>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400 hover:text-white border border-white/10 p-1 px-2 hover:bg-neutral-800 transition cursor-pointer shrink-0"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Studio Utilities Toolbar */}
        <section className="bg-white p-4 border border-brand-charcoal/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
          <div>
            <h2 class="text-xs font-bold font-mono text-brand-charcoal uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-charcoal" /> Studio Coordinates Dashboard
            </h2>
            <p className="text-[11px] text-neutral-450 uppercase mt-1 tracking-wide font-medium">Local workspace time coordinate: June 8, 2026</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              id="reset-db-scheduler-btn"
              onClick={handleResetDatabase}
              className="px-4 py-2 mt-0 border border-brand-charcoal/15 bg-[#FAF9F6] text-neutral-500 hover:text-brand-charcoal text-xs font-bold uppercase tracking-wider hover:bg-brand-gray-light transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-none min-h-[44px] touch-manipulation"
              title="Reset schedule, roster, and gears to sample datasets"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Studio Database
            </button>

            <button
              id="master-schedule-trigger"
              onClick={() => {
                setSelectedBooking(null);
                setPreselectedDate(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-brand-rust hover:bg-opacity-95 text-white font-extrabold text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md w-full sm:w-auto rounded-none min-h-[44px] touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              Book Studio Session
            </button>
          </div>
        </section>

        {/* --- MOBILE MOBILE NAVIGATION PILL TABS --- */}
        <div className="flex lg:hidden w-full bg-white border border-brand-charcoal/10 p-1 shadow-2xs select-none">
          <button
            onClick={() => setActiveMobileTab('calendar')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-r border-[#1A1A1A]/5 leading-none transition-all rounded-none ${
              activeMobileTab === 'calendar' ? 'bg-brand-charcoal text-white font-extrabold shadow-sm' : 'text-neutral-500 hover:text-brand-charcoal'
            }`}
          >
            📅 Schedule
          </button>
          <button
            onClick={() => setActiveMobileTab('roster')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-r border-[#1A1A1A]/5 leading-none transition-all rounded-none ${
              activeMobileTab === 'roster' ? 'bg-brand-charcoal text-white font-extrabold shadow-sm' : 'text-neutral-500 hover:text-brand-charcoal'
            }`}
          >
            👤 Crew
          </button>
          <button
            onClick={() => setActiveMobileTab('equipment')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center leading-none transition-all rounded-none ${
              activeMobileTab === 'equipment' ? 'bg-brand-charcoal text-white font-extrabold shadow-sm' : 'text-neutral-500 hover:text-brand-charcoal'
            }`}
          >
            📦 Gear
          </button>
        </div>

        {/* Master Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* RESPONSIVE FILTERABLE LEFT COLUMN */}
          <section className={`lg:col-span-4 space-y-6 ${activeMobileTab !== 'calendar' ? 'block' : 'hidden lg:block'}`}>
            
            {/* Roster Panel Selection (Shown on mobile 'roster' tab, hidden on gear, always block on desktop) */}
            <div className={activeMobileTab === 'roster' || activeMobileTab === 'calendar' ? 'block' : 'hidden lg:block'}>
              <RosterPanel
                employees={employees}
                onToggleActive={handleToggleEmployeeActive}
                onAddEmployee={handleAddEmployee}
                selectedFilter={selectedEmployeeFilter}
                onSelectFilter={(id) => {
                  setSelectedEmployeeFilter(id);
                  if (id) {
                    setNotification(`Calendar filtered. Isolating booked assignments of: ${employees.find(e => e.id === id)?.name}`);
                    setActiveMobileTab('calendar'); // Auto jump to calendar on click filter for convenience!
                  }
                }}
              />
            </div>

            {/* Equipment Panel Selection */}
            <div className={activeMobileTab === 'equipment' || activeMobileTab === 'calendar' ? 'block' : 'hidden lg:block'}>
              <EquipmentPanel
                equipment={equipment}
                onToggleAvailable={handleToggleEquipmentAvailable}
                onAddEquipment={handleAddEquipment}
                selectedFilter={selectedEquipmentFilter}
                onSelectFilter={(id) => {
                  setSelectedEquipmentFilter(id);
                  if (id) {
                    setNotification(`Calendar filtered. Highlighting bookings of gear asset: "${equipment.find(eq => eq.id === id)?.name}"`);
                    setActiveMobileTab('calendar'); // Auto jump to calendar for best response!
                  }
                }}
              />
            </div>

          </section>

          {/* RIGHT COLUMN: Studio Calendar Board - Shown on mobile 'calendar' tab, always on desktop */}
          <section className={`lg:col-span-8 space-y-4 ${activeMobileTab === 'calendar' ? 'block' : 'hidden lg:block'}`}>
            
            {/* Active Filters Summary block if any filter is active */}
            {(selectedEmployeeFilter || selectedEquipmentFilter) && (
              <div className="p-3 bg-brand-linen/90 border border-brand-rust/20 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[9px] font-bold text-brand-rust uppercase tracking-wider bg-brand-rust/10 p-1 px-1.5 select-none">
                    Isolated View (Schedule Isolated)
                  </span>
                  
                  {selectedEmployeeFilter && (
                    <span className="font-bold text-brand-charcoal bg-white border px-2 py-0.5 rounded-none inline-flex items-center gap-1 scale-95 font-sans leading-none">
                      Staff: {employees.find(e => e.id === selectedEmployeeFilter)?.name}
                      <button onClick={() => setSelectedEmployeeFilter(null)} className="hover:text-red-650 font-mono text-[10px] pl-1 font-extrabold cursor-pointer">×</button>
                    </span>
                  )}

                  {selectedEquipmentFilter && (
                    <span className="font-bold text-brand-charcoal bg-white border px-2 py-0.5 rounded-none inline-flex items-center gap-1 scale-95 font-sans leading-none">
                      Gear: {equipment.find(eq => eq.id === selectedEquipmentFilter)?.name}
                      <button onClick={() => setSelectedEquipmentFilter(null)} className="hover:text-red-650 font-mono text-[10px] pl-1 font-extrabold cursor-pointer">×</button>
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setSelectedEmployeeFilter(null);
                    setSelectedEquipmentFilter(null);
                  }}
                  className="text-[9.5px] font-bold uppercase tracking-wider text-brand-rust hover:underline shrink-0 cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Main Calendar View Grid Component */}
            <CalendarView
              bookings={bookings}
              employees={employees}
              equipment={equipment}
              onSelectBooking={handleOpenBookingDetails}
              onSelectDate={handleOpenNewDateBooking}
              selectedEmployeeFilter={selectedEmployeeFilter}
              selectedEquipmentFilter={selectedEquipmentFilter}
            />

            {/* Help / Informational Legend Card */}
            <div className="bg-white p-4 border border-brand-charcoal/10 text-xs space-y-2 leading-relaxed shadow-2xs">
              <h5 className="font-bold text-brand-charcoal uppercase text-[9px] tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Navigation & Usage tips
              </h5>
              <ul className="list-disc list-inside text-[11px] text-[#73716E] space-y-1 pr-1 pl-0.5">
                <li><strong className="text-brand-charcoal">Switch Views on Mobile:</strong> Use the top navigation pill tabs ("Schedule", "Crew", "Gear") to coordinate rosters.</li>
                <li><strong className="text-brand-charcoal">Quick Book:</strong> Click into an empty grid block in mock days (or tap Agenda) to schedule custom orders.</li>
                <li><strong className="text-brand-charcoal">Overlapping warnings:</strong> When planning, the modal automatically evaluates equipment and assistance collisions in real-time.</li>
              </ul>
            </div>

          </section>

        </div>

      </main>

      {/* Elegant Aesthetic Studio Footer */}
      <footer className="mt-28 border-t border-brand-charcoal/10 py-10 text-center text-xs text-[#8A8885] max-w-7xl mx-auto space-y-1 px-4 sm:px-6">
        <p className="font-serif italic font-bold text-brand-charcoal">Studio Schedule Coordinator — Mobile & Desktop Enabled</p>
        <p className="text-[10px] uppercase tracking-widest font-mono font-medium opacity-80">Local Native Client Studio Operations Desk • Built for Tauri wrappers</p>
      </footer>

      {/* Dynamic Unified Scheduler Modal */}
      {isModalOpen && (
        <BookingModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
            setPreselectedDate(null);
          }}
          onSave={handleSaveBooking}
          onDelete={handleDeleteBooking}
          bookingToEdit={selectedBooking}
          selectedDate={preselectedDate}
          employees={employees}
          equipment={equipment}
          allBookings={bookings}
        />
      )}

    </div>
  );
}
