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
              Studio Scheduler Space
            </h1>
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
                {{ t.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Workspace Overview Gauges -->
      <div class="grid grid-cols-3 gap-2 bg-[#222222] border border-white/10 p-2.5 max-w-xl text-neutral-300">
        <!-- Staff Count -->
        <div class="px-2 pr-3 border-r border-white/10">
          <div class="flex justify-between items-center text-[8px] uppercase tracking-wider font-bold">
            <span>Staff Enrolled</span>
            <span class="font-mono text-neutral-450">{{ staffCount }}</span>
          </div>
        </div>

        <!-- Equipment Count -->
        <div class="px-2 pr-3 border-r border-white/10">
          <div class="flex justify-between items-center text-[8px] uppercase tracking-wider font-bold">
            <span>Inventory Items</span>
            <span class="font-mono text-neutral-450">{{ equipmentCount }}</span>
          </div>
        </div>

        <!-- Bookings Count -->
        <div class="px-2">
          <div class="flex justify-between items-center text-[8px] uppercase tracking-wider font-bold">
            <span>Total Bookings</span>
            <span class="font-mono text-neutral-450">{{ cycleBookingsCount }}</span>
          </div>
        </div>
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
  equipmentCount: Number,
  cycleBookingsCount: Number,
});

defineEmits(['update:activeTenantId']);
</script>
