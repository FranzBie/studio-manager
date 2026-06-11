<template>
  <header class="bg-[#1A1A1A] text-white shadow-xl sticky top-0 z-40 border-b border-white/5">
    <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

      <!-- Studio SaaS Branding and Workspace Scope -->
      <div class="flex items-center gap-3.5">
        <div class="bg-[#C54B2C] px-3.5 py-2.5 border border-[#C54B2C]/20 shadow-inner flex items-center justify-center shrink-0">
          <span class="font-serif font-bold italic text-md text-white tracking-widest select-none leading-none">
            S★S
          </span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xs font-mono font-bold tracking-[0.1em] text-white uppercase leading-none">
              Studio Scheduler SaaS Space
            </h1>
            <span class="bg-[#C54B2C]/95 text-white font-mono text-[8px] px-1.5 py-0.5 tracking-widest font-extrabold uppercase">
              {{ activeTenant.plan.toUpperCase() }}
            </span>
          </div>

          <!-- Tenant Switching Workspace Selector -->
          <div class="mt-1 flex items-center gap-1.5">
            <span class="text-[10px] text-neutral-400 font-mono">Workspace:</span>
            <select
              :value="activeTenantId"
              @change="$emit('update:activeTenantId', $event.target.value)"
              class="bg-neutral-900 border border-white/10 text-xs font-serif font-bold italic text-[#FAF9F6] focus:outline-none focus:border-[#C54B2C] px-2 py-0.5"
            >
              <option v-for="t in tenants" :key="t.id" :value="t.id">
                {{ t.name }} ({{ t.plan.toUpperCase() }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- SaaS Quota Overview Gauges -->
      <div class="grid grid-cols-3 gap-2 bg-[#222222] border border-white/10 p-2.5 max-w-xl text-neutral-300">
        <!-- Staff Limit -->
        <div class="px-2 pr-3 border-r border-white/10">
          <div class="flex justify-between items-center text-[8px] uppercase tracking-wider font-bold">
            <span>Staff Limit</span>
            <span class="font-mono text-neutral-450">{{ staffCount }}/{{ activeTenant.max_staff }}</span>
          </div>
          <div class="w-full bg-neutral-800 h-1.5 mt-1 border border-white/5 relative overflow-hidden">
            <div
              class="h-full transition-all duration-300"
              :class="staffPercentage >= 100 ? 'bg-red-500' : staffPercentage >= 80 ? 'bg-amber-500' : 'bg-[#C54B2C]'"
              :style="{ width: `${staffPercentage}%` }"
            />
          </div>
        </div>

        <!-- Equipment Limit -->
        <div class="px-2 pr-3 border-r border-white/10">
          <div class="flex justify-between items-center text-[8px] uppercase tracking-wider font-bold">
            <span>Inventory</span>
            <span class="font-mono text-neutral-450">{{ equipmentCount }}/{{ activeTenant.max_equipment }}</span>
          </div>
          <div class="w-full bg-neutral-800 h-1.5 mt-1 border border-white/5 relative overflow-hidden">
            <div
              class="h-full transition-all duration-300"
              :class="equipmentPercentage >= 100 ? 'bg-red-500' : equipmentPercentage >= 80 ? 'bg-amber-500' : 'bg-blue-500'"
              :style="{ width: `${equipmentPercentage}%` }"
            />
          </div>
        </div>

        <!-- Monthly Bookings Limit -->
        <div class="px-2">
          <div class="flex justify-between items-center text-[8px] uppercase tracking-wider font-bold">
            <span>Cycle Bookings</span>
            <span class="font-mono text-neutral-450">{{ cycleBookingsCount }}/{{ activeTenant.max_monthly_bookings }}</span>
          </div>
          <div class="w-full bg-neutral-800 h-1.5 mt-1 border border-white/5 relative overflow-hidden">
            <div
              class="h-full transition-all duration-300"
              :class="bookingsPercentage >= 100 ? 'bg-red-500' : bookingsPercentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'"
              :style="{ width: `${bookingsPercentage}%` }"
            />
          </div>
        </div>
      </div>

      <!-- SaaS Profile Actions -->
      <div class="flex gap-2">
        <button
          @click="$emit('open-upgrade')"
          class="px-4 py-2 bg-[#C54B2C] hover:bg-opacity-90 text-white font-extrabold text-[10px] uppercase tracking-widest cursor-pointer transition border border-transparent shadow-md"
        >
          Upgrade Membership 💎
        </button>
      </div>

    </div>
  </header>
</template>

<script setup>
defineProps({
  activeTenant: Object,
  activeTenantId: String,
  tenants: Array,
  staffCount: Number,
  staffPercentage: Number,
  equipmentCount: Number,
  equipmentPercentage: Number,
  cycleBookingsCount: Number,
  bookingsPercentage: Number
});

defineEmits(['update:activeTenantId', 'open-upgrade']);
</script>
