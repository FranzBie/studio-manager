import { useState, useEffect, FormEvent } from 'react';
import { Booking, Employee, Equipment } from '../types';
import { X, Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';

interface BookingModalProps {
  onClose: () => void;
  onSave: (booking: Booking) => void;
  onDelete?: (bookingId: string) => void;
  bookingToEdit: Booking | null;
  selectedDate: string | null;
  employees: Employee[];
  equipment: Equipment[];
  allBookings: Booking[];
}

export default function BookingModal({
  onClose,
  onSave,
  onDelete,
  bookingToEdit,
  selectedDate,
  employees,
  equipment,
  allBookings
}: BookingModalProps) {
  // Form fields
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [reservedEquipmentIds, setReservedEquipmentIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');

  // Form local validation error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Overlap & resource conflicts indicators
  const [warnings, setWarnings] = useState<string[]>([]);

  // Initialize fields on change or load
  useEffect(() => {
    setErrorMessage(null);
    if (bookingToEdit) {
      setTitle(bookingToEdit.title);
      setClientName(bookingToEdit.clientName);
      setClientPhone(bookingToEdit.clientPhone);
      setClientEmail(bookingToEdit.clientEmail);
      setDate(bookingToEdit.date);
      setStartTime(bookingToEdit.startTime);
      setEndTime(bookingToEdit.endTime);
      setAssignedEmployeeIds(bookingToEdit.employeeIds);
      setReservedEquipmentIds(bookingToEdit.equipmentIds);
      setNotes(bookingToEdit.notes || '');
      setStatus(bookingToEdit.status);
    } else {
      setTitle('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('11:00');
      setAssignedEmployeeIds([]);
      setReservedEquipmentIds([]);
      setNotes('');
      setStatus('scheduled');
    }
  }, [bookingToEdit, selectedDate]);

  // Handle conflicts algorithm
  useEffect(() => {
    if (!date || !startTime || !endTime) {
      setWarnings([]);
      return;
    }

    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const sA = parseTime(startTime);
    const eA = parseTime(endTime);

    if (sA >= eA) {
      setWarnings(['Warning: Start clock must precede end clock.']);
      return;
    }

    const activeConflicts: string[] = [];

    // Filter out our current booking so we don't conflict with ourselves
    const otherBookings = allBookings.filter(
      (b) => b.id !== (bookingToEdit?.id || '') && b.status !== 'cancelled'
    );

    otherBookings.forEach((b) => {
      if (b.date !== date) return;

      const sB = parseTime(b.startTime);
      const eB = parseTime(b.endTime);

      const hasOverlap = sA < eB && sB < eA;
      if (!hasOverlap) return;

      // Staff allocation overlap
      assignedEmployeeIds.forEach((empId) => {
        if (b.employeeIds.includes(empId)) {
          const empName = employees.find((e) => e.id === empId)?.name || 'Crew Member';
          activeConflicts.push(
            `Staff Allocation Overlap: ${empName} is already scheduled for "${b.title}" at ${b.startTime} - ${b.endTime} on this day.`
          );
        }
      });

      // Gear allocation overlap
      reservedEquipmentIds.forEach((eqId) => {
        if (b.equipmentIds.includes(eqId)) {
          const eqName = equipment.find((e) => e.id === eqId)?.name || 'Gear item';
          activeConflicts.push(
            `Gear Allocation Overlap: "${eqName}" is already reserved for "${b.title}" at ${b.startTime} - ${b.endTime} on this day.`
          );
        }
      });
    });

    setWarnings(activeConflicts);
  }, [date, startTime, endTime, assignedEmployeeIds, reservedEquipmentIds, allBookings, bookingToEdit, employees, equipment]);

  const toggleEmployee = (empId: string) => {
    setErrorMessage(null);
    setAssignedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const toggleEquipment = (eqId: string) => {
    setErrorMessage(null);
    setReservedEquipmentIds((prev) =>
      prev.includes(eqId) ? prev.filter((id) => id !== eqId) : [...prev, eqId]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title || !clientName || !date || !startTime || !endTime) {
      setErrorMessage('Missing parameters: Please input matching Session Title and Client Full Name.');
      return;
    }

    const parsedStart = startTime.split(':').map(Number);
    const parsedEnd = endTime.split(':').map(Number);
    if (parsedStart[0] * 60 + parsedStart[1] >= parsedEnd[0] * 60 + parsedEnd[1]) {
      setErrorMessage('Validation Error: Start clock timing must be strictly before End clock timing.');
      return;
    }

    const bookingData: Booking = {
      id: bookingToEdit?.id || `BOK-${Math.floor(100 + Math.random() * 900)}`,
      title,
      clientName,
      clientPhone,
      clientEmail,
      date,
      startTime,
      endTime,
      employeeIds: assignedEmployeeIds,
      equipmentIds: reservedEquipmentIds,
      notes,
      status,
      dateCreated: bookingToEdit?.dateCreated || new Date().toISOString().split('T')[0]
    };

    onSave(bookingData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/45 backdrop-blur-xs flex items-center justify-center p-2 xs:p-4 overflow-y-auto">
      <div 
        id="booking-modal-content"
        className="bg-[#FDFCFB] rounded-none border border-brand-charcoal/20 shadow-2xl w-full max-w-3xl overflow-hidden focus:outline-none flex flex-col max-h-[96vh] sm:max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-brand-charcoal/10 px-4 xs:px-6 py-4 xs:py-5 bg-brand-linen shrink-0">
          <div>
            <h2 className="text-base xs:text-lg font-serif font-bold italic text-brand-charcoal flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-rust" />
              {bookingToEdit ? 'Configure Studio Reservation' : 'Schedule New Creative Session'}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-neutral-450 mt-0.5 uppercase tracking-wide font-medium">
              {bookingToEdit ? `Order Reference: ${bookingToEdit.id}` : 'Allocate photographers & equipment schedules in real-time'}
            </p>
          </div>
          <button 
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 rounded-none text-neutral-400 hover:text-brand-charcoal transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Validation Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 text-red-700 p-3.5 border-b border-red-100 text-xs flex items-start gap-2 animate-fade-in font-medium">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold uppercase text-[9px] tracking-wider text-red-600 mb-0.5">Please check entries</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Modal Scroll Content */}
        <form onSubmit={handleSubmit} className="p-4 xs:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: Client & Booking Core */}
          <div className="space-y-3.5">
            <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-rust border-b border-brand-charcoal/10 pb-1.5">
              1. General Engagement Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Session Title / Shoot Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Portrait, Fashion Editorial, Family Shoot"
                  value={title}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setTitle(e.target.value);
                  }}
                  className="w-full text-xs px-3 py-2.5 border border-brand-charcoal/10 rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-brand-rust focus:border-brand-rust text-brand-charcoal font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={clientName}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setClientName(e.target.value);
                  }}
                  className="w-full text-xs px-3 py-2.5 border border-brand-charcoal/10 rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-brand-rust focus:border-brand-rust text-brand-charcoal font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Client Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 555-0143"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-brand-charcoal/10 rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-brand-rust focus:border-brand-rust text-brand-charcoal font-medium"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Client Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. sarah.j@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-brand-charcoal/10 rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-brand-rust focus:border-brand-rust text-brand-charcoal font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Date & Clock parameters */}
          <div className="space-y-3.5">
            <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-rust border-b border-brand-charcoal/10 pb-1.5">
              2. Date & Scheduling Slot
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Engagement Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-brand-charcoal/10 rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-brand-rust focus:border-brand-rust text-brand-charcoal font-semibold min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Start Clock Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-brand-charcoal/10 rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-brand-rust focus:border-brand-rust text-brand-charcoal font-semibold min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  End Clock Time *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-brand-charcoal/10 rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-brand-rust focus:border-brand-rust text-brand-charcoal font-semibold min-h-[40px]"
                />
              </div>
            </div>
          </div>

          {/* Conflict Alert Section */}
          {warnings.length > 0 && (
            <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-none space-y-1 animate-fade-in text-xs font-medium">
              <div className="flex items-center gap-2 text-amber-800 text-[10px] font-bold uppercase tracking-wider select-none">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Schedule Conflicts Identified
              </div>
              <ul className="list-disc list-inside text-neutral-600 pl-1 space-y-1 font-sans leading-normal text-[11px]">
                {warnings.map((warn, idx) => (
                  <li key={idx} className="break-words">{warn}</li>
                ))}
              </ul>
              <p className="text-[9px] text-[#A67C00] italic mt-1 font-medium">
                * Overlapping schedules values are advisory and do not prevent saving.
              </p>
            </div>
          )}

          {/* Section 3: Employee Assignment & Equipment Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Employee Roster Selection (Mobile click optimized) */}
            <div className="space-y-3">
              <div className="border-b border-brand-charcoal/10 pb-1 flex justify-between items-center">
                <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-rust">
                  3. Assigned Photographers
                </h4>
                <span className="text-[8px] font-mono font-bold text-neutral-400 uppercase">
                  {assignedEmployeeIds.length} Selected
                </span>
              </div>

              <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                {employees.filter(e => e.isActive).map((emp) => {
                  const isChecked = assignedEmployeeIds.includes(emp.id);
                  return (
                    <button
                      type="button"
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={`w-full flex items-center justify-between p-2.5 text-left border rounded-none transition text-xs cursor-pointer min-h-[44px] ${
                        isChecked
                          ? 'border-brand-rust bg-brand-linen text-brand-charcoal font-semibold ring-1 ring-brand-rust/20'
                          : 'border-brand-charcoal/10 hover:border-brand-charcoal/20 bg-white text-neutral-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: emp.avatarColor }}
                        />
                        <div>
                          <p className="text-xs font-bold leading-none text-brand-charcoal">{emp.name}</p>
                          <p className="text-[10px] text-neutral-450 mt-0.5 font-medium leading-none">{emp.role}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded-none border-brand-charcoal/20 text-brand-rust focus:ring-0 cursor-pointer pointer-events-none h-4 w-4 shrink-0 bg-white"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment Resource Selection */}
            <div className="space-y-3">
              <div className="border-b border-brand-charcoal/10 pb-1 flex justify-between items-center">
                <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-rust">
                  4. Reserved Equipment Inventory
                </h4>
                <span className="text-[8px] font-mono font-bold text-neutral-400 uppercase">
                  {reservedEquipmentIds.length} Reserved
                </span>
              </div>

              <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                {equipment.filter(e => e.isAvailable).map((eq) => {
                  const isChecked = reservedEquipmentIds.includes(eq.id);
                  return (
                    <button
                      type="button"
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={`w-full flex items-center justify-between p-2.5 text-left border rounded-none transition text-xs cursor-pointer min-h-[44px] ${
                        isChecked
                          ? 'border-brand-rust bg-brand-linen text-brand-charcoal font-semibold ring-1 ring-brand-rust/20'
                          : 'border-brand-charcoal/10 hover:border-brand-charcoal/20 bg-white text-neutral-500'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold leading-none text-brand-charcoal">{eq.name}</p>
                        <p className="text-[9.5px] text-neutral-450 mt-0.5 uppercase tracking-wide font-mono font-bold leading-none">
                          {eq.category} • {eq.serialNumber}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded-none border-brand-charcoal/20 text-brand-rust focus:ring-0 cursor-pointer pointer-events-none h-4 w-4 shrink-0 bg-white"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Section 4: Reservation Status & Notes */}
          <div className="space-y-3.5">
            <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-rust border-b border-brand-charcoal/10 pb-1.5">
              5. Setup Notes & State
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Session Coordinates & Notes
                </label>
                <textarea
                  placeholder="Add background setup notes, print parameters requested, or shoot locations here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-brand-charcoal/10 rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-brand-rust focus:border-brand-rust text-brand-charcoal h-24 resize-none font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                  Booking Status State
                </label>
                <div className="grid grid-cols-3 md:grid-cols-1 gap-2 mt-1 select-none">
                  {(['scheduled', 'completed', 'cancelled'] as const).map((st) => (
                    <label 
                      key={st}
                      className={`flex items-center gap-1.5 p-2.5 border cursor-pointer select-none transition text-center justify-center md:justify-start rounded-none uppercase tracking-wider text-[9.5px] font-bold min-h-[44px] ${
                        status === st 
                          ? 'border-brand-rust bg-brand-linen text-brand-charcoal font-bold' 
                          : 'border-brand-charcoal/10 bg-white hover:border-brand-charcoal/20 text-neutral-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="booking-status"
                        checked={status === st}
                        onChange={() => setStatus(st)}
                        className="rounded-none text-brand-rust border-brand-charcoal/20 focus:ring-0 cursor-pointer h-4 w-4 shrink-0 bg-white"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Controls (Generous touch area heights) */}
        <div className="border-t border-brand-charcoal/10 p-4 sm:p-5 bg-brand-linen flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 select-none">
          <div>
            {bookingToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Confirm deleting this booking entirely?`)) {
                    onDelete(bookingToEdit.id);
                  }
                }}
                className="px-4 py-3 text-[10px] uppercase tracking-wider font-extrabold text-red-650 hover:text-white bg-transparent hover:bg-red-650 border border-red-200 hover:border-red-650 rounded-none transition cursor-pointer flex items-center justify-center gap-1 min-h-[44px] w-full"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancel & Delete Booking
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-3 text-[10px] uppercase font-bold tracking-wider text-neutral-500 hover:text-brand-charcoal bg-white border border-brand-charcoal/20 hover:border-brand-charcoal/30 rounded-none transition cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              id="confirm-booking-btn"
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-6 py-3 text-[10px] uppercase tracking-widest font-extrabold text-white bg-brand-rust hover:bg-opacity-90 rounded-none shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <CheckCircle className="w-4 h-4" />
              Save Reservation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
