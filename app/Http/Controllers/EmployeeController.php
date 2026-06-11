<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support0\\Collection;

class EmployeeController extends Controller
{
    /**
     * Retrieve staff members associated with the active tenant.
     */
    public function index(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        $employees = Employee::where('tenant_id', $tenantId)->get();

        return response()->json($employees);
    }

    /**
     * Create/enroll a new photographer/assistant under the active tenant.
     */
    public function store(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID');
        if (!$tenantId) {
            return response()->json(['error' => 'Missing tenant header scope'], 400);
        }

        $tenant = Tenant::findOrFail($tenantId);

        // Verify SaaS Business Rule Quota Limits
        if (!$tenant->canAddStaff()) {
            return response()->json([
                'success' => false,
                'message' => "Quota Limit Exceeded: Your current dynamic plan (" . strtoupper($tenant->plan) . ") only allows a max of {$tenant->max_staff} active staff. Upgrade to unlock unlimited seats."
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'avatar_color' => 'nullable|string',
        ]);

        $validated['id'] = 'EMP-' . rand(100, 999);
        $validated['tenant_id'] = $tenantId;
        $validated['is_active'] = true;

        $employee = Employee::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Staff roster member logged successfully.',
            'data' => $employee
        ], 201);
    }

    /**
     * Toggle active availability state (Duty vs Holiday leave).
     */
    public function toggleActive(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);
        
        $employee->update([
            'is_active' => !$employee->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Staff member availability state toggled.',
            'data' => $employee
        ]);
    }
}
