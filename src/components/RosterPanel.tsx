import { useState, FormEvent } from 'react';
import { Employee } from '../types';
import { User, Plus, X, Phone, Mail, ToggleLeft, ToggleRight, Check } from 'lucide-react';

interface RosterPanelProps {
  employees: Employee[];
  onToggleActive: (empId: string) => void;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  selectedFilter: string | null;
  onSelectFilter: (empId: string | null) => void;
}

export default function RosterPanel({
  employees,
  onToggleActive,
  onAddEmployee,
  selectedFilter,
  onSelectFilter
}: RosterPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // New employee state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarColor, setAvatarColor] = useState('#D97706');

  const COLORS = [
    '#D97706', // Amber
    '#DC2626', // Red
    '#2563EB', // Blue
    '#059669', // Emerald
    '#7C3AED', // Purple
    '#0891B2', // Cyan
    '#DB2777', // Pink
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      alert('Name and Role are required.');
      return;
    }

    onAddEmployee({
      name,
      role,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@studio.com`,
      phone: phone || '555-0100',
      avatarColor,
      isActive: true
    });

    // Reset Form
    setName('');
    setRole('');
    setEmail('');
    setPhone('');
    setIsAdding(false);
  };

  return (
    <div className="bg-[#FDFCFB] border border-brand-charcoal/10 rounded-none p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-brand-charcoal/10 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rust flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-rust" /> Studio Staff & Roster
          </h4>
          <p className="text-[10px] text-neutral-450 uppercase mt-0.5 font-medium">Filter schedule or toggle active availability</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 text-xs font-bold bg-brand-linen hover:bg-brand-gray-light border border-brand-charcoal/10 hover:border-brand-charcoal/20 text-brand-charcoal transition cursor-pointer flex items-center gap-0.5 rounded-none"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="text-[10px] uppercase tracking-wider pr-1">{isAdding ? 'Close' : 'Add Staff'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-brand-linen p-4 border border-brand-charcoal/10 space-y-3.5 animate-fade-in">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-0.5">Staff Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Clara Oswald"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-brand-charcoal/10 bg-white rounded-none focus:ring-1 focus:ring-brand-rust text-brand-charcoal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-0.5">Studio Role / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Retoucher, Assist Operator"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-brand-charcoal/10 bg-white rounded-none focus:ring-1 focus:ring-brand-rust text-brand-charcoal focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450 mb-0.5">Email</label>
              <input
                type="email"
                placeholder="clara@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-2 py-1 border border-brand-charcoal/10 bg-white rounded-none focus:ring-1 focus:ring-brand-rust text-brand-charcoal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450 mb-0.5">Phone</label>
              <input
                type="text"
                placeholder="555-5555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-2 py-1 border border-brand-charcoal/10 bg-white rounded-none focus:ring-1 focus:ring-brand-rust text-brand-charcoal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-1">Calendar Display Color</label>
            <div className="flex gap-2">
              {COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setAvatarColor(col)}
                  className={`w-5 h-5 rounded-full transition-all border ${
                    avatarColor === col ? 'ring-2 ring-brand-rust scale-110 border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-brand-charcoal hover:bg-opacity-95 text-white font-bold text-[10px] uppercase tracking-wider transition cursor-pointer rounded-none"
          >
            Confirm Add Staff Member
          </button>
        </form>
      )}

      {/* Roster List */}
      <div className="space-y-2">
        {employees.map((emp) => {
          const isSelected = selectedFilter === emp.id;
          return (
            <div
              key={emp.id}
              className={`p-3 border transition-all duration-150 flex items-center justify-between ${
                !emp.isActive ? 'opacity-45 bg-[#FAF9F6]/40' : 'bg-white'
              } ${
                isSelected 
                  ? 'border-brand-rust bg-brand-linen/40 ring-1 ring-brand-rust/20 shadow-xs' 
                  : 'border-brand-charcoal/5 hover:border-brand-charcoal/15'
              }`}
            >
              {/* Left Column info (and click triggers filter toggle) */}
              <div 
                className="flex items-start gap-2.5 flex-1 cursor-pointer select-none"
                onClick={() => onSelectFilter(isSelected ? null : emp.id)}
                title="Click to toggle schedule filter"
              >
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: emp.avatarColor }}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 text-white font-extrabold" /> : emp.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0 pr-1.5">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-bold leading-none truncate text-brand-charcoal ${isSelected ? 'text-brand-rust font-extrabold' : ''}`}>
                      {emp.name}
                    </p>
                    {isSelected && (
                      <span className="text-[9px] font-bold text-brand-rust bg-brand-rust/10 px-1 py-0.5 rounded-none font-sans scale-90 shrink-0">
                        FILTER
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-450 font-medium leading-none mt-1 truncate">{emp.role}</p>
                  
                  {/* Hover detail block */}
                  <div className="mt-1.5 flex flex-col gap-0.5 font-mono text-[9px] text-[#A3A19E]">
                    <span className="truncate flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5 inline shrink-0" /> {emp.email}
                    </span>
                    <span className="truncate flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 inline shrink-0" /> {emp.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column slide to Toggle Availability */}
              <div className="shrink-0 pl-1">
                <button
                  onClick={() => onToggleActive(emp.id)}
                  className="text-neutral-400 hover:text-brand-charcoal p-1 transition cursor-pointer"
                  title={emp.isActive ? "Mark Inactive / Holiday state" : "Mark Active / Available state"}
                >
                  {emp.isActive ? (
                    <ToggleRight className="w-6 h-6 text-[#059669]" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-neutral-350" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedFilter && (
        <button
          onClick={() => onSelectFilter(null)}
          className="w-full text-center text-[10px] border border-brand-rust/25 bg-brand-linen text-brand-rust p-1.5 font-semibold uppercase tracking-wider block hover:bg-brand-rust hover:text-white transition cursor-pointer rounded-none"
        >
          Clear Roster Filter (Show All)
        </button>
      )}
    </div>
  );
}
