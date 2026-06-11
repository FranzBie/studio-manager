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
                'equipment_count' => $equipmentCount,
                'bookings_count' => $currentMonthBookingsCount,
            ]
        ]);
    }

    /**
     * Log and initiate a new Tenant workspace organization.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tenants,name',
        ]);

        $slug = Str::slug($validated['name']);

        $tenant = Tenant::create([
            'name' => $validated['name'],
            'slug' => $slug,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your new Studio Workspace has been created!',
            'tenant' => $tenant
        ], 201);
    }
}
