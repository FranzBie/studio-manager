<template>
  <div class="bg-white border border-[#1A1A1A]/10 rounded-none overflow-hidden shadow-sm">

    <!-- Dates Title Navigation Strip -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[#1A1A1A]/10 bg-[#FAF9F6]">
      <div class="flex items-center gap-2 flex-wrap">
        <h3 class="text-md font-serif font-bold italic text-[#1A1A1A] leading-none">
          {{ months[currentMonth] }} {{ currentYear }}
        </h3>
        <span class="font-mono text-[9px] bg-[#1A1A1A] text-neutral-350 font-bold uppercase tracking-[0.15em] px-2.5 py-1">
          {{ activeTenant.name.toUpperCase() }} CALENDAR INDEX
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          @click="$emit('jump-today')"
          class="px-3 py-1.5 text-[10px] font-mono uppercase font-bold bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A]/30 transition select-none cursor-pointer"
        >
          Jump to Today
        </button>
        <div class="flex items-center border border-[#1A1A1A]/10 p-0.5 bg-white ml-2">
          <button @click="$emit('navigate', -1)" class="p-1 px-2.5 hover:bg-neutral-100 text-xs font-bold font-mono">◀</button>
          <span class="w-[1px] h-4 bg-neutral-200" />
          <button @click="$emit('navigate', 1)" class="p-1 px-2.5 hover:bg-neutral-100 text-xs font-bold font-mono">▶</button>
        </div>
      </div>
    </div>

    <!-- Grid Day Columns Design labels -->
    <div class="grid grid-cols-7 border-b border-[#1A1A1A]/10 bg-[#FAF9F6] text-center py-2">
      <span v-for="day in daysOfWeek" :key="day" class="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
        {{ day }}
      </span>
    </div>

    <!-- Grid Day Squares Board -->
    <div class="grid grid-cols-7 grid-rows-5 auto-rows-fr min-h-[580px] bg-neutral-100 divide-x divide-y divide-[#1A1A1A]/5">
      <div
        v-for="(cell, index) in gridCells"
        :key="index"
        @click="$emit('cell-click', cell.dateStr)"
        :class="[
          'p-1.5 flex flex-col justify-between group transition-all duration-150 relative min-h-[110px]',
          cell.isCurrentMonth ? 'bg-white' : 'bg-[#FAF9F6]/30 opacity-40',
          'hover:bg-[#FAF9F6]/80 cursor-pointer'
        ]"
      >
        <!-- Day Header -->
        <div class="flex items-center justify-between pointer-events-none select-none">
          <span
            :class="[
              'text-xs font-mono font-bold flex items-center justify-center w-5.5 h-5.5 leading-none',
              cell.dateStr === todayStr ? 'bg-[#C54B2C] text-white font-extrabold rounded-none ring-1 ring-[#C54B2C]' : 'text-[#1A1A1A]/80'
            ]"
          >
            {{ cell.dayNum }}
          </span>
          <span v-if="cell.isCurrentMonth" class="text-[9px] font-mono font-extrabold text-[#C54B2C] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            + BOOK
          </span>
        </div>

        <!-- Active Scheduled Booking Chips inside day square -->
        <div class="mt-2 space-y-1.5 flex-1 flex flex-col justify-end max-h-[140px] overflow-y-auto">
          <div
            v-for="b in getBookingsForDate(cell.dateStr)"
            :key="b.id"
            @click.stop="$emit('edit-booking', b)"
            :class="[
              'text-[9.5px] p-1.5 text-left border shadow-xs leading-normal select-none truncate rounded-none font-sans',
              b.status === 'cancelled' ? 'line-through opacity-40 bg-neutral-100 border-neutral-300' : '',
              doesBookingMatchFilters(b) ? 'font-bold border-l-4' : 'opacity-25 hover:opacity-100'
            ]"
            :style="getBookingColorStyle(b)"
            :title="`${b.title} [${b.startTime} - ${b.endTime}]`"
          >
            <div class="flex items-center justify-between text-[8px] opacity-75 font-mono font-semibold">
              <span>{{ b.startTime }} - {{ b.endTime }}</span>
              <span v-if="b.status === 'completed'" class="text-emerald-600">✓</span>
            </div>
            <p class="truncate font-medium text-neutral-900 mt-0.5 leading-none tracking-tight">{{ b.title }}</p>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
defineProps({
  months: Array,
  currentMonth: Number,
  currentYear: Number,
  activeTenant: Object,
  daysOfWeek: Array,
  gridCells: Array,
  todayStr: String,
  getBookingsForDate: Function,
  doesBookingMatchFilters: Function,
  getBookingColorStyle: Function
});

defineEmits(['jump-today', 'navigate', 'cell-click', 'edit-booking']);
</script>
