<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\Tenant;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    /**
     * Retrieve hardware inventory belonging to the active tenant.
     */
    public function index(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        $equipment = Equipment::where('tenant_id', $tenantId)->get();

        return response()->json($equipment);
    }

    /**
     * Store and log a new gear asset under the active tenant.
     */
    public function store(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        $tenant = Tenant::findOrFail($tenantId);

        // Verify SaaS Business Rule Equipment Limits
        if (!$tenant->canAddEquipment()) {
            return response()->json([
                'success' => false,
                'message' => "Quota Limit Exceeded: Your current plan (" . strtoupper($tenant->plan) . ") caps equipment at {$tenant->max_equipment} items. Upgrade your subscription to expand gear capacity."
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'serial_number' => 'required|string',
        ]);

        $validated['id'] = 'EQ-' . rand(100, 999);
        $validated['tenant_id'] = $tenantId;
        $validated['is_available'] = true;

        $equipment = Equipment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hardware equipment logged and registered.',
            'data' => $equipment
        ], 201);
    }

    /**
     * Toggle physically available state (Storage vs Checked out / Repair Maintenance).
     */
    public function toggleAvailable(Request $request, $id)
    {
        $equipment = Equipment::findOrFail($id);

        $equipment->update([
            'is_available' => !$equipment->is_available
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Equipment availability status updated.',
            'data' => $equipment
        ]);
    }
}
