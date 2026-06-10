<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    /**
     * Display a listing of all registered studio sessions for this tenant.
     */
    public function index(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        // The Booking model global scope applies the tenant filter automatically.
        $bookings = Booking::orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Store a newly created reservation in storage.
     */
    public function store(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        $tenant = Tenant::findOrFail($tenantId);

        // Enforce SaaS booking cycle quota limits
        if (!$tenant->canAddBooking()) {
            return response()->json([
                'success' => false,
                'message' => "Quota Limit Exceeded: Your current plan (" . strtoupper($tenant->plan) . ") only allows a max of {$tenant->max_monthly_bookings} bookings per monthly cycle. Upgrade to unlock bulk scheduling!"
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'nullable|string',
            'client_email' => 'nullable|email',
            'date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|string', // expectation: "HH:MM"
            'end_time' => 'required|string',   // expectation: "HH:MM"
            'employee_ids' => 'nullable|array',
            'equipment_ids' => 'nullable|array',
            'notes' => 'nullable|string',
            'status' => ['nullable', Rule::in(['scheduled', 'completed', 'cancelled'])]
        ]);

        // Allocate tenant ID and generate booking key
        $validated['tenant_id'] = $tenantId;
        if (!$request->has('id')) {
            $validated['id'] = 'BOK-' . rand(100, 999);
        } else {
            $validated['id'] = $request->input('id');
        }

        $booking = Booking::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'New reservation logged successfully.',
            'data' => $booking
        ], 201);
    }

    /**
     * Update the specified reservation coordinate in storage.
     */
    public function update(Request $request, $id)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        $booking = Booking::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'client_name' => 'sometimes|required|string|max:255',
            'client_phone' => 'nullable|string',
            'client_email' => 'nullable|email',
            'date' => 'sometimes|required|date_format:Y-m-d',
            'start_time' => 'sometimes|required|string',
            'end_time' => 'sometimes|required|string',
            'employee_ids' => 'nullable|array',
            'equipment_ids' => 'nullable|array',
            'notes' => 'nullable|string',
            'status' => ['sometimes', Rule::in(['scheduled', 'completed', 'cancelled'])]
        ]);

        $booking->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Reservation updated parameters synchronized complete.',
            'data' => $booking
        ]);
    }

    /**
     * Remove the specified reservation entirely from storage.
     */
    public function destroy(Request $request, $id)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        $booking = Booking::findOrFail($id);
        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reservation cleared completely from calendar.'
        ]);
    }

    /**
     * Retrieve active conflicts on a date and time slot for warnings.
     */
    public function checkOverlaps(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'booking_id' => 'nullable|string',
            'employee_ids' => 'nullable|array',
            'equipment_ids' => 'nullable|array',
        ]);

        $date = $request->input('date');
        $startTime = $request->input('start_time');
        $endTime = $request->input('end_time');
        $bookingId = $request->input('booking_id');
        $employeeIds = $request->input('employee_ids', []);
        $equipmentIds = $request->input('equipment_ids', []);

        // Retrieve other active schedule reservations on same day
        $otherBookings = Booking::onDate($date)
            ->where('status', '!=', 'cancelled')
            ->when($bookingId, function ($query) use ($bookingId) {
                return $query->where('id', '!=', $bookingId);
            })
            ->get();

        $conflicts = [];

        foreach ($otherBookings as $b) {
            // Overlapping time detection
            $overlaps = ($startTime < $b->end_time && $b->start_time < $endTime);
            if (!$overlaps) continue;

            // Compute overlapping items
            if (!empty($employeeIds)) {
                $sharedEmps = array_intersect($employeeIds, $b->employee_ids ?? []);
                foreach ($sharedEmps as $empId) {
                    $conflicts[] = "Staff collision detected with overlap of assist constraints in '{$b->title}'.";
                }
            }

            if (!empty($equipmentIds)) {
                $sharedEqs = array_intersect($equipmentIds, $b->equipment_ids ?? []);
                foreach ($sharedEqs as $eqId) {
                    $conflicts[] = "Gear item collision overlap detected on '{$b->title}'.";
                }
            }
        }

        return response()->json([
            'has_conflicts' => !empty($conflicts),
            'conflicts' => $conflicts
        ]);
    }
}
