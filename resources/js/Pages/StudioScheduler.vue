<template>
  <div class="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans antialiased pb-24">
    
    <Header
      :active-tenant="activeTenant"
      v-model:active-tenant-id="activeTenantId"
      :tenants="tenants"
      :staff-count="staffCount"
      :equipment-count="equipmentCount"
      :cycle-bookings-count="cycleBookingsCount"
    />

    <main class="max-w-7xl mx-auto px-6 mt-8 space-y-6">

      <!-- General Studio Informational Toast -->
      <div v-if="notification" class="bg-[#EDECE5] border-l-4 border-[#1A1A1A] text-[#1A1A1A] px-5 py-3.5 flex items-start justify-between gap-4 shadow-sm text-xs select-none">
        <div class="flex items-start gap-2.5">
          <span class="text-[#C54B2C] mt-0.5 font-bold shrink-0">ℹ️</span>
          <div>
            <p class="font-mono uppercase text-[9px] font-bold text-neutral-500 leading-none mb-1">Tenant Workspace Update</p>
            <p class="text-[11px] leading-relaxed font-medium text-neutral-700">{{ notification }}</p>
          </div>
        </div>
        <button @click="notification = null" class="text-[10px] text-neutral-500 hover:text-black font-mono underline select-none cursor-pointer shrink-0">
          Hide info
        </button>
      </div>

      <!-- Core SaaS Controls Utilities -->
      <section class="bg-white p-5 border border-[#1A1A1A]/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
        <div>
          <h2 class="text-xs font-bold font-mono text-[#1A1A1A] uppercase tracking-[0.2em] flex items-center gap-1.5 leading-none">
            📅 Active Studio Operations Dashboard
          </h2>
          <p class="text-[11px] text-neutral-400 uppercase mt-1.5 tracking-wide font-medium">
            Active Tenant Workspace: <span class="font-serif font-extrabold italic text-neutral-800">{{ activeTenant.name }}</span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Switch Tenant Seed button -->
          <button 
            @click="createNewTenantDialog"
            class="px-4 py-2 border border-[#1A1A1A]/15 bg-[#FAF9F6] text-[#1A1A1A] hover:bg-[#F5F5F0] text-[10.5px] font-mono uppercase tracking-wider transition cursor-pointer"
          >
            + Register Studio Tenant
          </button>

          <!-- Book Studio Button -->
          <button
            @click="openNewBooking()"
            class="px-5 py-2.5 bg-[#C54B2C] hover:bg-[#B03F21] text-white font-extrabold text-xs uppercase tracking-widest transition cursor-pointer flex items-center gap-2 shadow-md rounded-none"
          >
            + Book Studio Session
          </button>
        </div>
      </section>

      <!-- Grid Master Workspace Panels -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- SIDEBAR RESOURCE PANELS (SaaS limits applied per Tenant) -->
        <section class="lg:col-span-4 space-y-6">
          
          <!-- Staff Panel -->
          <div class="bg-white border border-[#1A1A1A]/10 rounded-none p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-[0.2em] text-[#C54B2C]">
                  👤 Studio Staff & Personnel
                </h4>
                <p class="text-[10px] text-neutral-450 uppercase mt-0.5 font-medium leading-none">
                  Total Enrolled: {{ staffCount }}
                </p>
              </div>
              <button
                @click="attemptOpenAddStaff"
                class="px-2 py-1 text-[10px] font-bold bg-[#FAF9F6] border border-[#1A1A1A]/10 hover:bg-neutral-100 transition rounded-none"
              >
                {{ showAddStaffForm ? 'Close' : 'Add Staff' }}
              </button>
            </div>

            <!-- Add Staff Form -->
            <form v-if="showAddStaffForm" @submit.prevent="addStaffMember" class="bg-[#FAF9F6] p-4 border border-[#1A1A1A]/10 space-y-3">
              <!-- Warn user inside form if reaching cap -->
              <div v-if="staffCount >= activeTenant.max_staff" class="p-2.5 bg-red-50 text-red-705 border border-red-200 text-[10px] leading-tight font-medium uppercase font-mono">
                🛑 Seats Cap Reached! Please upgrade to Pro to register additional staff members.
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-0.5">Name *</label>
                <input v-model="newStaff.name" required type="text" placeholder="e.g. Liam Cross" class="w-full text-xs px-2.5 py-1.5 border border-[#1A1A1A]/10 bg-white focus:outline-none" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-0.5">Role/Title *</label>
                <input v-model="newStaff.role" required type="text" placeholder="e.g. Lead Videographer" class="w-full text-xs px-2.5 py-1.5 border border-[#1A1A1A]/10 bg-white focus:outline-none" />
              </div>
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <label class="block text-[10px] uppercase font-bold text-neutral-450 mb-0.5">Contact Email *</label>
                  <input v-model="newStaff.email" required type="email" placeholder="liam@studio.com" class="w-full text-xs px-2.5 py-1.5 border border-[#1A1A1A]/10 bg-white focus:outline-none" />
                </div>
              </div>
              <button 
                type="submit" 
                class="w-full py-2 bg-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase tracking-wider rounded-none transition"
              >
                Enroll Staff Member
              </button>
            </form>

            <!-- Roster List -->
            <div class="space-y-2">
              <div 
                v-for="emp in filteredEmployees" 
                :key="emp.id"
                :class="[
                  'p-3 border transition-all duration-150 flex items-center justify-between',
                  !emp.isActive ? 'opacity-45 bg-[#FAF9F6]/40' : 'bg-white',
                  selectedEmployeeFilter === emp.id ? 'border-[#C54B2C] bg-[#FAF9F6]' : 'border-[#1A1A1A]/5 hover:border-[#1A1A1A]/15'
                ]"
              >
                <div @click="toggleEmployeeFilter(emp.id)" class="flex items-start gap-2.5 flex-1 cursor-pointer select-none">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white mt-0.5 shrink-0" :style="{ backgroundColor: emp.avatarColor }">
                    {{ selectedEmployeeFilter === emp.id ? '✓' : emp.name.charAt(0) }}
                  </div>
                  <div class="flex-1 min-w-0 pr-1.5">
                    <div class="flex items-center gap-1.5">
                      <p class="text-xs font-bold leading-none text-[#1A1A1A]" :class="{ 'text-[#C54B2C] font-extrabold': selectedEmployeeFilter === emp.id }">
                        {{ emp.name }}
                      </p>
                      <span v-if="selectedEmployeeFilter === emp.id" class="text-[8px] font-bold text-[#C54B2C] bg-[#C54B2C]/10 px-1 py-0.5">
                        FILTER
                      </span>
                    </div>
                    <p class="text-[10px] text-neutral-400 mt-1 truncate">{{ emp.role }}</p>
                    <div class="mt-1 flex flex-col font-mono text-[9px] text-neutral-450 leading-none">
                      <span>✉️ {{ emp.email }}</span>
                    </div>
                  </div>
                </div>
                <button @click="toggleEmployeeActive(emp.id)" class="p-1 cursor-pointer text-xs uppercase font-extrabold">
                  <span :class="emp.isActive ? 'text-emerald-600' : 'text-neutral-400'">
                    {{ emp.isActive ? 'On-Duty' : 'Away' }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Equipment Panel -->
          <div class="bg-white border border-[#1A1A1A]/10 rounded-none p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-[0.2em] text-[#C54B2C]">
                  📦 Studio Physical Gear
                </h4>
                <p class="text-[10px] text-neutral-450 uppercase mt-0.5 font-medium leading-none">
                  Total Logged: {{ equipmentCount }} items
                </p>
              </div>
              <button
                @click="attemptOpenAddEquipment"
                class="px-2 py-1 text-[10px] font-bold bg-[#FAF9F6] border border-[#1A1A1A]/10 hover:bg-neutral-100 transition rounded-none"
              >
                {{ showAddEquipmentForm ? 'Close' : 'Add Gear' }}
              </button>
            </div>

            <!-- Add Gear Form -->
            <form v-if="showAddEquipmentForm" @submit.prevent="addEquipmentItem" class="bg-[#FAF9F6] p-4 border border-[#1A1A1A]/10 space-y-3">

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-0.5">Model / Gear title *</label>
                <input v-model="newGear.name" placeholder="e.g. Leica SL3 (Body)" required type="text" class="w-full text-xs px-2.5 py-1.5 border border-[#1A1A1A]/10 bg-white focus:outline-none" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-0.5">Equipment Category *</label>
                <select v-model="newGear.category" class="w-full text-xs px-2.5 py-1.5 border border-[#1A1A1A]/10 bg-white focus:outline-none">
                  <option value="camera">Medium-Format & DSLRs</option>
                  <option value="lens">Anamorphic & Prime Lenses</option>
                  <option value="lighting">Studio Strobes & Modifiers</option>
                  <option value="audio">Lavalier and Field Monitors</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider mb-0.5">Serial Serial Code *</label>
                <input v-model="newGear.serialNumber" required type="text" placeholder="SN-LEICA881A" class="w-full text-xs px-2.5 py-1.5 border border-[#1A1A1A]/10 bg-white focus:outline-none" />
              </div>
              <button 
                type="submit" 
                class="w-full py-2 bg-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase tracking-wider rounded-none transition"
              >
                Log Hardware Gear
              </button>
            </form>

            <!-- Equipment List -->
            <div class="space-y-2">
              <div 
                v-for="eq in filteredEquipment" 
                :key="eq.id"
                :class="[
                  'p-3 border transition-all duration-150 flex items-center justify-between',
                  !eq.isAvailable ? 'opacity-45 bg-[#FAF9F6]/40' : 'bg-white',
                  selectedEquipmentFilter === eq.id ? 'border-[#C54B2C] bg-[#FAF9F6]' : 'border-[#1A1A1A]/5 hover:border-[#1A1A1A]/15'
                ]"
              >
                <div @click="toggleEquipmentFilter(eq.id)" class="flex items-start gap-2 flex-1 cursor-pointer select-none">
                  <span class="mt-0.5 shrink-0 text-xs text-neutral-450">🏷️</span>
                  <div class="flex-1 min-w-0 pr-1.5">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <p class="text-xs font-bold leading-tight" :class="{ 'text-[#C54B2C] font-extrabold': selectedEquipmentFilter === eq.id }">
                        {{ eq.name }}
                      </p>
                      <span v-if="selectedEquipmentFilter === eq.id" class="text-[8px] font-semibold text-[#C54B2C] bg-[#C54B2C]/10 px-1 py-0.5">
                        FILTER
                      </span>
                    </div>
                    <p class="text-[9px] uppercase tracking-wide font-mono font-bold mt-1 text-neutral-400">
                      {{ eq.category }} • {{ eq.serialNumber }}
                    </p>
                  </div>
                </div>
                <button @click="toggleEquipmentAvailable(eq.id)" class="p-1 cursor-pointer text-xs uppercase font-extrabold">
                  <span :class="eq.isAvailable ? 'text-emerald-600' : 'text-red-500'">
                    {{ eq.isAvailable ? 'Storage' : 'In Repair' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- CALENDAR BOARD CONTENT -->
        <section class="lg:col-span-8 space-y-4">
          
          <!-- Filters Indicator Summary Box -->
          <div v-if="selectedEmployeeFilter || selectedEquipmentFilter" class="p-3 bg-[#FAF8F3] border border-[#C54B2C]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-[9px] font-bold text-[#C54B2C] uppercase tracking-wider bg-[#C54B2C]/10 p-1 select-none leading-none">
                Isolated Workspace Filter View Active
              </span>
              <span v-if="selectedEmployeeFilter" class="bg-white border border-[#1A1A1A]/10 text-[10.5px] px-2 py-0.5 flex items-center gap-1">
                Staff: <span class="font-bold text-[#C54B2C]">{{ getEmployeeName(selectedEmployeeFilter) }}</span>
                <button @click="selectedEmployeeFilter = null" class="font-extrabold text-red-500 hover:underline px-0.5">×</button>
              </span>
              <span v-if="selectedEquipmentFilter" class="bg-white border border-[#1A1A1A]/10 text-[10.5px] px-2 py-0.5 flex items-center gap-1">
                Gear: <span class="font-bold text-neutral-800">{{ getEquipmentName(selectedEquipmentFilter) }}</span>
                <button @click="selectedEquipmentFilter = null" class="font-extrabold text-red-500 hover:underline px-0.5">×</button>
              </span>
            </div>
            <button @click="clearAllFilters" class="text-[10px] font-bold uppercase tracking-wider text-[#C54B2C] hover:underline cursor-pointer">
              Clear All Filters
            </button>
          </div>

          <CalendarGrid
            :months="MONTHS"
            :current-month="currentMonth"
            :current-year="currentYear"
            :active-tenant="activeTenant"
            :days-of-week="DAYS_OF_WEEK"
            :grid-cells="gridCells"
            :today-str="todayStr"
            :get-bookings-for-date="getBookingsForDate"
            :does-booking-match-filters="doesBookingMatchFilters"
            :get-booking-color-style="getBookingColorStyle"
            @jump-today="jumpToToday"
            @navigate="navigateMonth"
            @cell-click="onCellClick"
            @edit-booking="openEditBooking"
          />

          <!-- Aesthetic Info Card block -->
          <div class="bg-white p-5 border border-[#1A1A1A]/10 text-xs space-y-3 shadow-xs">
            <h5 class="font-bold text-[#1A1A1A] uppercase text-[9px] tracking-[0.2em] leading-none">
              ℹ️ Standard Workspace Guide
            </h5>
            <ol class="list-decimal list-inside text-[11px] text-neutral-500 space-y-1.5 leading-relaxed">
              <li>Use the workspace selector in the header to bounce between active studio tenants.</li>
              <li>Resource allocations and schedules are isolated per workspace.</li>
              <li>Add staff and gear to expand your workspace capacity.</li>
            </ol>
          </div>

        </section>

      </div>
    </main>

    <BookingModal
      :is-open="isModalOpen"
      :booking-id="modalBookingId"
      :active-tenant="activeTenant"
      :cycle-bookings-count="cycleBookingsCount"
      :form="form"
      :modal-conflicts="modalConflicts"
      :active-employees="activeEmployees"
      :active-equipment="activeEquipment"
      @close="closeModal"
      @save="saveBooking"
      @delete="deleteBooking"
      @toggle-employee="toggleFormEmployee"
      @toggle-equipment="toggleFormEquipment"
    />



  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import Header from '../Components/Header.vue';
import CalendarGrid from '../Components/CalendarGrid.vue';
import BookingModal from '../Components/BookingModal.vue';

// --- STABLE DEFAULT MULTI-TENANT CONFIGS ---
const DEFAULT_TENANTS = [
  { id: 'TNT-001', name: 'PixelCraft Editorial Labs', slug: 'pixelcraft-labs', plan: 'pro', plan_status: 'active', max_staff: 10, max_equipment: 15, max_monthly_bookings: 150 },
  { id: 'TNT-002', name: 'Aether Portraiture Space', slug: 'aether-portraits', plan: 'basic', plan_status: 'active', max_staff: 3, max_equipment: 5, max_monthly_bookings: 5 },
  { id: 'TNT-003', name: 'Massive Agency & Media Inc', slug: 'massive-agency', plan: 'enterprise', plan_status: 'active', max_staff: 999, max_equipment: 999, max_monthly_bookings: 9999 }
];

const STABLE_EMPLOYEES = [
  // PixelCraft (TNT-001)
  { id: 'EMP-1', tenant_id: 'TNT-001', name: 'Alex Rivera', role: 'Lead Portraitist', email: 'alex.r@pixelcraft.com', avatarColor: '#D97706', isActive: true },
  { id: 'EMP-2', tenant_id: 'TNT-001', name: 'Elena Rostova', role: 'Fashion Editorials', email: 'elena.r@pixelcraft.com', avatarColor: '#DC2626', isActive: true },
  { id: 'EMP-3', tenant_id: 'TNT-001', name: 'Arthur Dent', role: 'Lighting Specialist', email: 'arthur.d@pixelcraft.com', avatarColor: '#2563EB', isActive: true },
  // Aether Portraits (TNT-002)
  { id: 'EMP-4', tenant_id: 'TNT-002', name: 'Chloe Vance', role: 'Commercial Lead', email: 'chloe.v@aether.com', avatarColor: '#059669', isActive: true },
  { id: 'EMP-5', tenant_id: 'TNT-002', name: 'Marcus Brody', role: 'Studio Assistant', email: 'marcus.b@aether.com', avatarColor: '#7C3AED', isActive: true }
];

const STABLE_EQUIPMENT = [
  // PixelCraft (TNT-001)
  { id: 'EQ-1', tenant_id: 'TNT-001', name: 'Sony Alpha 7R V (Body)', category: 'camera', serialNumber: 'SN-SNY8801A', isAvailable: true },
  { id: 'EQ-2', tenant_id: 'TNT-001', name: 'Hasselblad H6D-100c Medium Format', category: 'camera', serialNumber: 'SN-HBL1000C', isAvailable: true },
  { id: 'EQ-3', tenant_id: 'TNT-001', name: 'Sony FE 70-200mm f/2.8 GM Lens', category: 'lens', serialNumber: 'SN-LNS70200G', isAvailable: true },
  { id: 'EQ-4', tenant_id: 'TNT-001', name: 'Godox AD600 Pro Flash Rig', category: 'lighting', serialNumber: 'SN-GDX600PR', isAvailable: true },
  // Aether Portraits (TNT-002)
  { id: 'EQ-5', tenant_id: 'TNT-002', name: 'Canon EOS R5 Mirrorless', category: 'camera', serialNumber: 'SN-CAN8902B', isAvailable: true },
  { id: 'EQ-6', tenant_id: 'TNT-002', name: 'Aputure LS 600d Pro Spot Light', category: 'lighting', serialNumber: 'SN-APT600DPL', isAvailable: true }
];

const STABLE_BOOKINGS = [
  // PixelCraft
  { id: 'BOK-101', tenant_id: 'TNT-001', title: 'Maternity Editorial Shoot', clientName: 'Sarah Jenkins', clientEmail: 'sarah.j@example.com', date: '2026-06-03', startTime: '10:00', endTime: '12:30', employeeIds: ['EMP-1'], equipmentIds: ['EQ-1', 'EQ-4'], notes: 'Completed backdrops.', status: 'completed' },
  { id: 'BOK-102', tenant_id: 'TNT-001', title: 'Vertex corporate portrait session', clientName: 'Nadia Alvarez', clientEmail: 'nalvarez@vertex.com', date: '2026-06-08', startTime: '10:00', endTime: '12:00', employeeIds: ['EMP-2', 'EMP-3'], equipmentIds: ['EQ-2'], notes: 'Headshots for board members.', status: 'scheduled' },
  { id: 'BOK-103', tenant_id: 'TNT-001', title: 'Grace Family Outdoor Session', clientName: 'Diana Grace', clientEmail: 'diana.g@example.com', date: '2026-06-08', startTime: '14:30', endTime: '16:30', employeeIds: ['EMP-1'], equipmentIds: ['EQ-1', 'EQ-3'], notes: 'Shoot scheduled on the lawn.', status: 'scheduled' },
  // Aether Portraits
  { id: 'BOK-104', tenant_id: 'TNT-002', title: 'Commercial Video Prep', clientName: 'Studio Nouveau', clientEmail: 'contact@nouveau.com', date: '2022-06-08', startTime: '09:00', endTime: '11:00', employeeIds: ['EMP-4'], equipmentIds: ['EQ-5'], notes: 'Initial camera checks.', status: 'scheduled' }
];

// --- REACTIVE STATE MANAGEMENT ---
const tenants = ref([]);
const activeTenantId = ref('');
const activeTenant = computed(() => tenants.value.find(t => t.id === activeTenantId.value) || DEFAULT_TENANTS[0]);

const bookings = ref([]);
const employees = ref([]);
const equipment = ref([]);

const selectedEmployeeFilter = ref(null);
const selectedEquipmentFilter = ref(null);

const notification = ref('Tenant scopes initiated. Change active workspaces using the dropdown header to experience isolated SaaS databases.');
const showAddStaffForm = ref(false);
const showAddEquipmentForm = ref(false);

// Month Navigation coordinates starting at mock timeline June 2026
const currentYear = ref(2026);
const currentMonth = ref(5); // June
const todayStr = '2026-06-08';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Modal reservation data fields
const isModalOpen = ref(false);
const modalBookingId = ref(null);
const form = reactive({
  title: '',
  clientName: '',
  clientEmail: '',
  date: '',
  startTime: '09:00',
  endTime: '11:00',
  employeeIds: [],
  equipmentIds: [],
  notes: '',
  status: 'scheduled'
});

const newStaff = reactive({ name: '', role: '', email: '' });
const newGear = reactive({ name: '', category: 'camera', serialNumber: '' });

// --- INITIAL ON-MOUNTED INITIALIZATION ---
onMounted(() => {
  // Sync core Tenants from local storage if existing
  const localTn = localStorage.getItem('saas_studios_tenants');
  tenants.value = localTn ? JSON.parse(localTn) : DEFAULT_TENANTS;
  
  const localActiveTn = localStorage.getItem('saas_studios_active_tn_id');
  activeTenantId.value = localActiveTn || tenants.value[0].id;

  const localBk = localStorage.getItem('saas_studios_bookings');
  bookings.value = localBk ? JSON.parse(localBk) : STABLE_BOOKINGS;

  const localEmp = localStorage.getItem('saas_studios_employees');
  employees.value = localEmp ? JSON.parse(localEmp) : STABLE_EMPLOYEES;

  const localEq = localStorage.getItem('saas_studios_equipment');
  equipment.value = localEq ? JSON.parse(localEq) : STABLE_EQUIPMENT;
});

// Watch reactive properties to sync with persistent local storage
watch(tenants, (val) => localStorage.setItem('saas_studios_tenants', JSON.stringify(val)), { deep: true });
watch(bookings, (val) => localStorage.setItem('saas_studios_bookings', JSON.stringify(val)), { deep: true });
watch(employees, (val) => localStorage.setItem('saas_studios_employees', JSON.stringify(val)), { deep: true });
watch(equipment, (val) => localStorage.setItem('saas_studios_equipment', JSON.stringify(val)), { deep: true });
watch(activeTenantId, (val) => localStorage.setItem('saas_studios_active_tn_id', val));

// --- TENANT SPECIFIC DETECTED ENROLLMENTS LISTS (DATA ISOLATION VIEWPORTS) ---
const filteredEmployees = computed(() => {
  return employees.value.filter(emp => emp.tenant_id === activeTenantId.value);
});

const filteredEquipment = computed(() => {
  return equipment.value.filter(eq => eq.tenant_id === activeTenantId.value);
});

// Calculate metrics specifically for the active tenant
const staffCount = computed(() => filteredEmployees.value.length);
const equipmentCount = computed(() => filteredEquipment.value.length);
const cycleBookingsCount = computed(() => {
  return bookings.value.filter(b => b.tenant_id === activeTenantId.value && b.status !== 'cancelled').length;
});

// Percentage calculators for visual meters
const staffPercentage = computed(() => Math.min(100, (staffCount.value / activeTenant.value.max_staff) * 100));
const equipmentPercentage = computed(() => Math.min(100, (equipmentCount.value / activeTenant.value.max_equipment) * 100));
const bookingsPercentage = computed(() => Math.min(100, (cycleBookingsCount.value / activeTenant.value.max_monthly_bookings) * 100));

// Active resource list assignees
const activeEmployees = computed(() => filteredEmployees.value.filter(e => e.isActive));
const activeEquipment = computed(() => filteredEquipment.value.filter(eq => eq.isAvailable));

// Quota warning alert generator
const quotaWarning = computed(() => {
  const plan = activeTenant.value.plan.toUpperCase();
  if (staffCount.value >= activeTenant.value.max_staff) {
    return `Your ${plan} Workspace is at maximum personnel registration: (${staffCount.value}/${activeTenant.value.max_staff} staff enrolled). Upgrade now to onboard additional photographers.`;
  }
  if (equipmentCount.value >= activeTenant.value.max_equipment) {
    return `Your ${plan} inventory cap is occupied: (${equipmentCount.value}/${activeTenant.value.max_equipment} items). Unlock Unlimited Agency quotas to accommodate additional cameras and light modules.`;
  }
  if (cycleBookingsCount.value >= activeTenant.value.max_monthly_bookings) {
    return `Your monthly schedule cap has been depleted: (${cycleBookingsCount.value}/${activeTenant.value.max_monthly_bookings} bookings logged). Expand subscription limits to schedule dynamic portrait sessions.`;
  }
  return null;
});

// --- GOOGLE CALENDAR GRID GENERATOR ---
const gridCells = computed(() => {
  const cellsMap = [];
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
  const offset = new Date(currentYear.value, currentMonth.value, 1).getDay();

  // Prev Month fillers
  const prevY = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value;
  const prevM = currentMonth.value === 0 ? 11 : currentMonth.value - 1;
  const daysInPrev = new Date(prevY, prevM + 1, 0).getDate();

  for (let i = offset - 1; i >= 0; i--) {
    const day = daysInPrev - i;
    const moStr = String(prevM + 1).padStart(2, '0');
    cellsMap.push({
      dateStr: `${prevY}-${moStr}-${String(day).padStart(2, '0')}`,
      dayNum: day,
      isCurrentMonth: false
    });
  }

  // Current Month cells
  const curMoStr = String(currentMonth.value + 1).padStart(2, '0');
  for (let d = 1; d <= daysInMonth; d++) {
    cellsMap.push({
      dateStr: `${currentYear.value}-${curMoStr}-${String(d).padStart(2, '0')}`,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // Next month fillers
  const gridCapacity = Math.ceil((daysInMonth + offset) / 7) * 7;
  const rem = gridCapacity - cellsMap.length;
  const nextY = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value;
  const nextM = currentMonth.value === 11 ? 0 : currentMonth.value + 1;
  const nextMoStr = String(nextM + 1).padStart(2, '0');

  for (let n = 1; n <= rem; n++) {
    cellsMap.push({
      dateStr: `${nextY}-${nextMoStr}-${String(n).padStart(2, '0')}`,
      dayNum: n,
      isCurrentMonth: false
    });
  }

  return cellsMap;
});

// Convert time string HH:MM to numerical minutes
const parseTimeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// --- REAL-TIME OVERLAPPING CONFLICT DETECTION ENGINE ---
const conflictsCount = computed(() => {
  let overlapClashes = 0;
  const activeB = bookings.value.filter(
    b => b.tenant_id === activeTenantId.value && b.status !== 'cancelled' && b.status !== 'completed'
  );

  for (let i = 0; i < activeB.length; i++) {
    const b1 = activeB[i];
    const s1 = parseTimeToMinutes(b1.startTime);
    const e1 = parseTimeToMinutes(b1.endTime);

    for (let j = i + 1; j < activeB.length; j++) {
      const b2 = activeB[j];
      if (b1.date !== b2.date) continue;

      const s2 = parseTimeToMinutes(b2.startTime);
      const e2 = parseTimeToMinutes(b2.endTime);

      const overlaps = s1 < e2 && s2 < e1;
      if (!overlaps) continue;

      // Identify collisions in staff assignees or gear reserves
      const sharedStaff = b1.employeeIds.some(id => b2.employeeIds.includes(id));
      const sharedGear = b1.equipmentIds.some(id => b2.equipmentIds.includes(id));

      if (sharedStaff || sharedGear) {
        overlapClashes++;
      }
    }
  }
  return overlapClashes;
});

// Overlap notifications inside modal dialog while editing timings and assignees
const modalConflicts = computed(() => {
  if (!form.date || !form.startTime || !form.endTime) return [];

  const sA = parseTimeToMinutes(form.startTime);
  const eA = parseTimeToMinutes(form.endTime);

  if (sA >= eA) return ['Notice: Selected start time is set after your specified end timeline.'];

  const noticesList = [];
  const otherActiveBookings = bookings.value.filter(
    b => b.tenant_id === activeTenantId.value && b.id !== modalBookingId.value && b.status !== 'cancelled'
  );

  otherActiveBookings.forEach((b) => {
    if (b.date !== form.date) return;

    const sB = parseTimeToMinutes(b.startTime);
    const eB = parseTimeToMinutes(b.endTime);

    const overlaps = sA < eB && sB < eA;
    if (overlaps) {
      // Check resource collision overlaps
      form.employeeIds.forEach((empId) => {
        if (b.employeeIds.includes(empId)) {
          noticesList.push(`Staff Collision: ${getEmployeeName(empId)} has active duties on session "${b.title}" (${b.startTime}-${b.endTime}).`);
        }
      });

      form.equipmentIds.forEach((eqId) => {
        if (b.equipmentIds.includes(eqId)) {
          noticesList.push(`Hardware Collision: "${getEquipmentName(eqId)}" is assigned to session "${b.title}" (${b.startTime}-${b.endTime}).`);
        }
      });
    }
  });

  return noticesList;
});

// --- BOOKINGS & RESOURCE HANDLERS ---
const getEmployeeName = (id) => employees.value.find(e => e.id === id)?.name || 'Studio Staff';
const getEquipmentName = (id) => equipment.value.find(eq => eq.id === id)?.name || 'Studio Asset';

const getBookingsForDate = (dateStr) => {
  return bookings.value.filter(b => b.tenant_id === activeTenantId.value && b.date === dateStr);
};

const doesBookingMatchFilters = (b) => {
  if (selectedEmployeeFilter.value && !b.employeeIds.includes(selectedEmployeeFilter.value)) return false;
  if (selectedEquipmentFilter.value && !b.equipmentIds.includes(selectedEquipmentFilter.value)) return false;
  return true;
};

// Generates specific visual color borders based on employee designation colors
const getBookingColorStyle = (b) => {
  if (b.status === 'cancelled') return {};
  const firstEmpId = b.employeeIds.length > 0 ? b.employeeIds[0] : null;
  const staffObj = firstEmpId ? employees.value.find(e => e.id === firstEmpId) : null;
  const activeColor = staffObj ? staffObj.avatarColor : '#1A1A1A';

  return {
    backgroundColor: `${activeColor}06`,
    borderColor: `${activeColor}20`,
    borderLeftColor: activeColor,
    color: '#1A1A1A'
  };
};

const jumpToToday = () => {
  currentYear.value = 2026;
  currentMonth.value = 5; // June 2026 stable timeline
  notification.value = 'Timeline repositioned on original anchor month: June 2026.';
};

const navigateMonth = (direction) => {
  let m = currentMonth.value + direction;
  let y = currentYear.value;
  if (m < 0) {
    m = 11;
    y--;
  } else if (m > 11) {
    m = 0;
    y++;
  }
  currentMonth.value = m;
  currentYear.value = y;
};

const onTenantChanged = () => {
  selectedEmployeeFilter.value = null;
  selectedEquipmentFilter.value = null;
  notification.value = `Switched database scope to [${activeTenant.value.name}]. Isolating resource allocations and calendar schedules.`;
};

// Register alternative tenant demo
const createNewTenantDialog = () => {
  const name = prompt('Specify name of new Creative Studio Workspace:', 'Lumina Cinematics');
  if (!name || name.trim() === '') return;

  const cleanName = name.trim();
  const randomSlug = cleanName.toLowerCase().replace(/\s+/g, '-');
  const tntId = `TNT-${Math.floor(100 + Math.random() * 900)}`;

  const newTnt = {
    id: tntId,
    name: cleanName,
    slug: randomSlug,
  };

  tenants.value.push(newTnt);
  activeTenantId.value = tntId;
  onTenantChanged();
  notification.value = `Registered and enrolled [${cleanName}] as a new tenant on our server container. Enjoy sandbox isolation levels.`;
};

// --- ROSTER / ASSETS MUTATORS ---
const attemptOpenAddStaff = () => {
  showAddStaffForm.value = !showAddStaffForm.value;
};

const addStaffMember = () => {
  const generatedId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
  const avatarColors = ['#D97706', '#DC2626', '#2563EB', '#059669', '#7C3AED', '#0891B2'];
  const col = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  employees.value.push({
    id: generatedId,
    tenant_id: activeTenantId.value,
    name: newStaff.name,
    role: newStaff.role,
    email: newStaff.email,
    avatarColor: col,
    isActive: true
  });

  // Reset inputs
  newStaff.name = '';
  newStaff.role = '';
  newStaff.email = '';
  showAddStaffForm.value = false;
  notification.value = 'Roster updated. Newly hired employee mapped and isolated onto tenant namespace.';
};

const attemptOpenAddEquipment = () => {
  showAddEquipmentForm.value = !showAddEquipmentForm.value;
};

const addEquipmentItem = () => {
  const generatedId = `EQ-${Math.floor(100 + Math.random() * 900)}`;
  equipment.value.push({
    id: generatedId,
    tenant_id: activeTenantId.value,
    name: newGear.name,
    category: newGear.category,
    serialNumber: newGear.serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}B`,
    isAvailable: true
  });

  // Reset inputs
  newGear.name = '';
  newGear.category = 'camera';
  newGear.serialNumber = '';
  showAddEquipmentForm.value = false;
  notification.value = 'New gear successfully verified, recorded and assigned onto active storage logs.';
};

const toggleEmployeeActive = (empId) => {
  employees.value = employees.value.map(emp => {
    if (emp.id !== empId) return emp;
    const ns = !emp.isActive;
    notification.value = `${emp.name} availability toggled: set as ${ns ? 'available' : 'away on leave'}.`;
    return { ...emp, isActive: ns };
  });
};

const toggleEquipmentAvailable = (eqId) => {
  equipment.value = equipment.value.map(eq => {
    if (eq.id !== eqId) return eq;
    const ns = !eq.isAvailable;
    notification.value = `"${eq.name}" availability is now marked as ${ns ? 'physically in storage' : 'dispatched for repair'}.`;
    return { ...eq, isAvailable: ns };
  });
};

const toggleEmployeeFilter = (empId) => {
  selectedEmployeeFilter.value = selectedEmployeeFilter.value === empId ? null : empId;
};

const toggleEquipmentFilter = (eqId) => {
  selectedEquipmentFilter.value = selectedEquipmentFilter.value === eqId ? null : eqId;
};

const clearAllFilters = () => {
  selectedEmployeeFilter.value = null;
  selectedEquipmentFilter.value = null;
};

// --- RESERVATION FLOW ---
const onCellClick = (dateStr) => {
  openNewBooking(dateStr);
};

const openNewBooking = (targetDate = '') => {
  const dStr = targetDate || todayStr;
  
  // Set default initial model values
  form.title = '';
  form.clientName = '';
  form.clientEmail = '';
  form.date = dStr;
  form.startTime = '09:00';
  form.endTime = '11:00';
  form.employeeIds = [];
  form.equipmentIds = [];
  form.notes = '';
  form.status = 'scheduled';

  modalBookingId.value = null;
  isModalOpen.value = true;
};

const openEditBooking = (b) => {
  form.title = b.title;
  form.clientName = b.clientName;
  form.clientEmail = b.clientEmail || '';
  form.date = b.date;
  form.startTime = b.startTime;
  form.endTime = b.endTime;
  form.employeeIds = [...b.employeeIds];
  form.equipmentIds = [...b.equipmentIds];
  form.notes = b.notes || '';
  form.status = b.status;

  modalBookingId.value = b.id;
  isModalOpen.value = true;
};

const toggleFormEmployee = (empId) => {
  const idx = form.employeeIds.indexOf(empId);
  if (idx > -1) {
    form.employeeIds.splice(idx, 1);
  } else {
    form.employeeIds.push(empId);
  }
};

const toggleFormEquipment = (eqId) => {
  const idx = form.equipmentIds.indexOf(eqId);
  if (idx > -1) {
    form.equipmentIds.splice(idx, 1);
  } else {
    form.equipmentIds.push(eqId);
  }
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveBooking = () => {
  // Basic check for timing order
  const startM = parseTimeToMinutes(form.startTime);
  const endM = parseTimeToMinutes(form.endTime);
  if (startM >= endM) {
    alert('Invalid schedule parameters: session start must precede session end.');
    return;
  }

  if (modalBookingId.value) {
    // Editing matching entity ID
    bookings.value = bookings.value.map((b) => {
      if (b.id !== modalBookingId.value) return b;
      return {
        ...b,
        title: form.title,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        employeeIds: [...form.employeeIds],
        equipmentIds: [...form.equipmentIds],
        notes: form.notes,
        status: form.status
      };
    });
    notification.value = 'Reservation parameters synchronized successfully.';
  } else {
    // Save new booking entry
    const generatedId = `BOK-${Math.floor(100 + Math.random() * 900)}`;
    bookings.value.push({
      id: generatedId,
      tenant_id: activeTenantId.value,
      title: form.title,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      employeeIds: [...form.employeeIds],
      equipmentIds: [...form.equipmentIds],
      notes: form.notes,
      status: form.status
    });
    notification.value = 'A new creative reservation has been logged and isolated under the tenant namespace.';
  }

  isModalOpen.value = false;
};

const deleteBooking = (id) => {
  bookings.value = bookings.value.filter(b => b.id !== id);
  notification.value = 'Creative session reservation completely removed from scheduler memory.';
  isModalOpen.value = false;
};
</script>
