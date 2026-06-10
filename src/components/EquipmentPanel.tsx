import { useState, FormEvent } from 'react';
import { Equipment } from '../types';
import { Package, Plus, X, Tag, ToggleLeft, ToggleRight, Check } from 'lucide-react';

interface EquipmentPanelProps {
  equipment: Equipment[];
  onToggleAvailable: (eqId: string) => void;
  onAddEquipment: (eq: Omit<Equipment, 'id'>) => void;
  selectedFilter: string | null;
  onSelectFilter: (eqId: string | null) => void;
}

export default function EquipmentPanel({
  equipment,
  onToggleAvailable,
  onAddEquipment,
  selectedFilter,
  onSelectFilter
}: EquipmentPanelProps) {
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'camera' | 'lens' | 'lighting' | 'audio' | 'support'>('camera');
  const [serialNumber, setSerialNumber] = useState('');

  const CATEGORIES = [
    { value: 'camera', label: 'Camera Bodies' },
    { value: 'lens', label: 'Lens Systems' },
    { value: 'lighting', label: 'Lighting Props' },
    { value: 'audio', label: 'Audio Tech' },
    { value: 'support', label: 'Stands & Grips' },
  ] as const;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Equipment name is a required field.');
      return;
    }

    const finalSerial = serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}B`;

    onAddEquipment({
      name,
      category,
      serialNumber: finalSerial,
      isAvailable: true,
    });

    // Reset Form
    setName('');
    setCategory('camera');
    setSerialNumber('');
    setIsAdding(false);
  };

  return (
    <div className="bg-[#FDFCFB] border border-brand-charcoal/10 rounded-none p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-brand-charcoal/10 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-rust flex items-center gap-1.5">
            <Package className="w-4 h-4 text-brand-rust" /> Studio Equipment
          </h4>
          <p className="text-[10px] text-neutral-450 uppercase mt-0.5 font-medium">Verify resource reserves or handle repairs</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 text-xs font-bold bg-brand-linen hover:bg-brand-gray-light border border-brand-charcoal/10 hover:border-brand-charcoal/20 text-brand-charcoal transition cursor-pointer flex items-center gap-0.5 rounded-none"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="text-[10px] uppercase tracking-wider pr-1">{isAdding ? 'Close' : 'Add Gear'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-brand-linen p-4 border border-brand-charcoal/10 space-y-3.5 animate-fade-in">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-0.5">Gear Title / Model *</label>
            <input
              type="text"
              required
              placeholder="e.g. Canon EOS R5 C"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-brand-charcoal/10 bg-white rounded-none focus:ring-1 focus:ring-brand-rust text-brand-charcoal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-0.5">Classification Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs px-2.5 py-1.5 border border-brand-charcoal/10 bg-white rounded-none focus:ring-1 focus:ring-brand-rust text-brand-charcoal focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal mb-0.5">Serial Code Number</label>
            <input
              type="text"
              placeholder="e.g. SN-EOS8822R"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-brand-charcoal/10 bg-white rounded-none focus:ring-1 focus:ring-brand-rust text-brand-charcoal focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-brand-charcoal hover:bg-opacity-95 text-white font-bold text-[10px] uppercase tracking-wider transition cursor-pointer rounded-none"
          >
            Log Into Inventory
          </button>
        </form>
      )}

      {/* Equipment List */}
      <div className="space-y-2">
        {equipment.map((eq) => {
          const isSelected = selectedFilter === eq.id;
          return (
            <div
              key={eq.id}
              className={`p-3 border transition-all duration-150 flex items-center justify-between ${
                !eq.isAvailable ? 'opacity-45 bg-[#FAF9F6]/40' : 'bg-white'
              } ${
                isSelected 
                  ? 'border-brand-rust bg-brand-linen/40 ring-1 ring-brand-rust/20 shadow-xs' 
                  : 'border-brand-charcoal/5 hover:border-brand-charcoal/15'
              }`}
            >
              {/* Left Column Gear Info */}
              <div
                className="flex items-start gap-2 flex-1 cursor-pointer select-none"
                onClick={() => onSelectFilter(isSelected ? null : eq.id)}
                title="Click to toggle equipment filter reservation highlights"
              >
                <div className={`mt-0.5 p-1 shrink-0 ${isSelected ? 'text-brand-rust' : 'text-neutral-400'}`}>
                  {isSelected ? <Check className="w-4 h-4 text-brand-rust font-extrabold" /> : <Tag className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0 pr-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-xs font-bold leading-tight text-brand-charcoal ${isSelected ? 'text-brand-rust font-extrabold' : ''}`}>
                      {eq.name}
                    </p>
                    {isSelected && (
                      <span className="text-[9px] font-bold text-brand-rust bg-brand-rust/10 px-1 py-0.5 rounded-none font-sans scale-90 shrink-0">
                        FILTER
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-neutral-450 uppercase tracking-wide font-mono font-bold mt-1">
                    {eq.category} • {eq.serialNumber}
                  </p>
                  
                  {!eq.isAvailable && (
                    <span className="mt-1 inline-block text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 font-mono uppercase rounded-none border border-red-100">
                      Under Repair
                    </span>
                  )}
                </div>
              </div>

              {/* Toggle available repair / storage states */}
              <div className="shrink-0 pl-1">
                <button
                  onClick={() => onToggleAvailable(eq.id)}
                  className="text-neutral-400 hover:text-brand-charcoal p-1 transition cursor-pointer"
                  title={eq.isAvailable ? "Flag Maintenance Needed / Out of service" : "Flag Clear / Back in inventory"}
                >
                  {eq.isAvailable ? (
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
          Clear Equipment Filter (Show All)
        </button>
      )}
    </div>
  );
}
