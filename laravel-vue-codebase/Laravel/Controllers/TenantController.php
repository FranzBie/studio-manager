<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    /**
     * Display subscription statistics & current plan details for a tenant.
     */
    public function show(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);

        // Calculate workspace stats
        $staffCount = $tenant->employees()->count();
        $equipmentCount = $tenant->equipment()->count();
        $currentMonthBookingsCount = $tenant->bookings()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return response()->json([
            'tenant' => $tenant,
            'stats' => [
                'staff_count' => $staffCount,
                'staff_limit' => $tenant->max_staff,
                'staff_percentage' => min(100, intval(($staffCount / $tenant->max_staff) * 100)),
                
                'equipment_count' => $equipmentCount,
                'equipment_limit' => $tenant->max_equipment,
                'equipment_percentage' => min(100, intval(($equipmentCount / $tenant->max_equipment) * 100)),
                
                'bookings_count' => $currentMonthBookingsCount,
                'bookings_limit' => $tenant->max_monthly_bookings,
                'bookings_percentage' => min(100, intval(($currentMonthBookingsCount / $tenant->max_monthly_bookings) * 100)),
            ]
        ]);
    }

    /**
     * Log and initiate a new SaaS Tenant workspace organization.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tenants,name',
            'plan' => ['nullable', Rule::in(['basic', 'pro', 'enterprise'])],
        ]);

        $plan = $request->input('plan', 'basic');
        $slug = Str::slug($validated['name']);

        // SaaS Quota Matrix allocations per plan tier
        $quotas = $this->getPlanQuotas($plan);

        $tenant = Tenant::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'plan' => $plan,
            'plan_status' => 'active',
            'max_staff' => $quotas['max_staff'],
            'max_equipment' => $quotas['max_equipment'],
            'max_monthly_bookings' => $quotas['max_monthly_bookings'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your new Studio SaaS Workspace has been created!',
            'tenant' => $tenant
        ], 201);
    }

    /**
     * Upgrade or downgrade the tenant's subscriptional billing plan.
     */
    public function updatePlan(Request $request, $id)
    {
        $request->validate([
            'plan' => ['required', Rule::in(['basic', 'pro', 'enterprise'])],
        ]);

        $tenant = Tenant::findOrFail($id);
        $newPlan = $request->input('plan');

        $quotas = $this->getPlanQuotas($newPlan);

        $tenant->update([
            'plan' => $newPlan,
            'plan_status' => 'active',
            'max_staff' => $quotas['max_staff'],
            'max_equipment' => $quotas['max_equipment'],
            'max_monthly_bookings' => $quotas['max_monthly_bookings'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Billing plan successfully updated. Workspace quotas resized!',
            'tenant' => $tenant
        ]);
    }

    /**
     * Helper: Plan Limits Configuration.
     */
    private function getPlanQuotas(string $plan): array
    {
        switch ($plan) {
            case 'pro':
                return [
                    'max_staff' => 10,
                    'max_equipment' => 15,
                    'max_monthly_bookings' => 150,
                ];
            case 'enterprise':
                return [
                    'max_staff' => 999, // Uncapped/Enterprise sizes
                    'max_equipment' => 999,
                    'max_monthly_bookings' => 9999,
                ];
            case 'basic':
            default:
                return [
                    'max_staff' => 3, // Basic plan fits small crews
                    'max_equipment' => 5,
                    'max_monthly_bookings' => 15,
                ];
        }
    }
}
