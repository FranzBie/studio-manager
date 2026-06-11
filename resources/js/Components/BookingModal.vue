<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-[#FDFCFB] border border-[#1A1A1A]/20 w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 py-4 bg-[#FAF9F6]">
        <div>
          <h2 class="text-md font-serif font-bold italic text-[#1A1A1A] flex items-center gap-1.5 leading-none">
            {{ bookingId ? 'Edit Reservation' : 'Schedule New Workspace Session' }}
          </h2>
          <p class="text-[9.5px] text-neutral-400 mt-1 uppercase font-mono tracking-wider">
            ID: {{ bookingId || '(Auto Assigned)' }}
          </p>
        </div>
        <button @click="$emit('close')" class="p-1 px-2 hover:bg-neutral-100 border border-neutral-200 font-bold">×</button>
      </div>

      <!-- Scrollable Form Container -->
      <form @submit.prevent="$emit('save')" class="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-[#1A1A1A]">

        <!-- Section 1: Customer Info -->
        <div class="space-y-3.5">
          <h3 class="text-[9px] font-extrabold uppercase tracking-widest text-[#C54B2C] border-b pb-0.5 mb-1">1. Customer Shoot Data</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-[10px] font-bold uppercase mb-0.5">Session Title *</label>
              <input v-model="form.title" placeholder="e.g. Editorial Fashion Shoot for VOGUE" required type="text" class="w-full p-2 border border-[#1A1A1A]/15 bg-white focus:outline-none" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase mb-0.5">Contact Full Name *</label>
              <input v-model="form.clientName" placeholder="Nadia Alvarez" required type="text" class="w-full p-2 border border-[#1A1A1A]/15 bg-white focus:outline-none" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase mb-0.5">Contact Email Address</label>
              <input v-model="form.clientEmail" placeholder="nadia@vertex.com" type="email" class="w-full p-2 border border-[#1A1A1A]/15 bg-white focus:outline-none" />
            </div>
          </div>
        </div>

        <!-- Section 2: Timing details -->
        <div class="space-y-3.5">
          <h3 class="text-[9px] font-extrabold uppercase tracking-widest text-[#C54B2C] border-b pb-0.5 mb-1">2. Allocation Timing</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold uppercase mb-0.5">Selected Date *</label>
              <input v-model="form.date" required type="date" class="w-full p-2 border border-[#1A1A1A]/15 bg-white focus:outline-none" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase mb-0.5">Start Time *</label>
              <input v-model="form.startTime" required type="time" class="w-full p-2 border border-[#1A1A1A]/15 bg-white focus:outline-none" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase mb-0.5">End Time *</label>
              <input v-model="form.endTime" required type="time" class="w-full p-2 border border-[#1A1A1A]/15 bg-white focus:outline-none" />
            </div>
          </div>
        </div>

        <!-- Dynamic Overlap checks inside modal drawer -->
        <div v-if="modalConflicts.length > 0" class="p-3 bg-amber-50 border border-amber-300 text-[11px] text-amber-800 space-y-1">
          <p class="font-bold font-mono">⚠️ CONFLICT WARNING: Overlapping schedules on this day</p>
          <ul class="list-disc pl-4.5 space-y-0.5">
            <li v-for="(warn, idx) in modalConflicts" :key="idx">{{ warn }}</li>
          </ul>
        </div>

        <!-- Resource Assignment grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Staff assignees -->
          <div class="space-y-2">
            <h4 class="text-[9px] font-bold uppercase tracking-wider text-[#C54B2C] border-b pb-1">3. Team Assignees</h4>
            <div class="space-y-1 max-h-[140px] overflow-y-auto bg-white p-2 border border-[#1A1A1A]/10">
              <div v-if="activeEmployees.length === 0" class="text-[10px] text-neutral-400 italic font-mono p-1">No active workspace staff loaded.</div>
              <button
                v-for="emp in activeEmployees"
                :key="emp.id"
                type="button"
                @click="$emit('toggle-employee', emp.id)"
                :class="[
                  'w-full p-1.5 border text-left flex justify-between items-center text-[10.5px] cursor-pointer',
                  form.employeeIds.includes(emp.id) ? 'border-[#C54B2C] bg-[#FAF9F6] font-semibold' : 'border-neutral-100 bg-white'
                ]"
              >
                <span class="truncate">{{ emp.name }} ({{ emp.role }})</span>
                <input type="checkbox" :checked="form.employeeIds.includes(emp.id)" class="pointer-events-none" />
              </button>
            </div>
          </div>

          <!-- Gear reserves -->
          <div class="space-y-2">
            <h4 class="text-[9px] font-bold uppercase tracking-wider text-[#C54B2C] border-b pb-1">4. Reserved Gear Inventory</h4>
            <div class="space-y-1 max-h-[140px] overflow-y-auto bg-white p-2 border border-[#1A1A1A]/10">
              <div v-if="activeEquipment.length === 0" class="text-[10px] text-neutral-400 italic font-mono p-1">No active equipment items logged.</div>
              <button
                v-for="eq in activeEquipment"
                :key="eq.id"
                type="button"
                @click="$emit('toggle-equipment', eq.id)"
                :class="[
                  'w-full p-1.5 border text-left flex justify-between items-center text-[10.5px] cursor-pointer',
                  form.equipmentIds.includes(eq.id) ? 'border-[#C54B2C] bg-[#FAF9F6] font-semibold' : 'border-neutral-100 bg-white'
                ]"
              >
                <span class="truncate">{{ eq.name }}</span>
                <input type="checkbox" :checked="form.equipmentIds.includes(eq.id)" class="pointer-events-none" />
              </button>
            </div>
          </div>
        </div>

        <!-- Section 3: Details -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
          <div class="sm:col-span-2">
            <label class="block text-[10px] font-bold uppercase mb-0.5">Shoot Setup Notes</label>
            <textarea v-model="form.notes" placeholder="Please specify backdrop requirements, lighting coordinates..." class="w-full text-xs p-2 border border-[#1A1A1A]/15 bg-white h-16 resize-none focus:outline-none" />
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase mb-0.5">Booking Status</label>
            <select v-model="form.status" class="w-full text-xs p-2 border border-[#1A1A1A]/15 bg-white mt-1">
              <option value="scheduled">Scheduled Status</option>
              <option value="completed">Completed Status</option>
              <option value="cancelled">Cancelled Status</option>
            </select>
          </div>
        </div>
      </form>

      <!-- Footer actions -->
      <div class="border-t border-[#1A1A1A]/10 p-4 bg-[#FAF9F6] flex items-center justify-between shrink-0">
        <div>
          <button
            v-if="bookingId"
            type="button"
            @click="$emit('delete', bookingId)"
            class="px-3.5 py-1.5 text-[10.5px] font-bold text-red-600 border border-red-200 bg-white hover:bg-red-50 cursor-pointer"
          >
            Cancel & Remove Session
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button @click="$emit('close')" type="button" class="px-4 py-2 border border-neutral-350 bg-white cursor-pointer hover:bg-neutral-50">
            Close
          </button>
          <button
            @click="$emit('save')"
            type="button"
            class="px-5 py-2 bg-[#C54B2C] text-white font-extrabold uppercase tracking-wide cursor-pointer hover:bg-opacity-95"
          >
            Save Reservation
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  bookingId: [String, Number],
  activeTenant: Object,
  cycleBookingsCount: Number,
  form: Object,
  modalConflicts: Array,
  activeEmployees: Array,
  activeEquipment: Array
});

defineEmits(['close', 'save', 'delete', 'toggle-employee', 'toggle-equipment']);
</script>
