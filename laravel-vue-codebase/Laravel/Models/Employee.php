<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string'; // EMP-XXX keys

    protected $fillable = [
        'id',
        'tenant_id',
        'name',
        'role',
        'email',
        'phone',
        'avatar_color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: Staff member belongs to a specific SaaS tenant.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope: Filter active staff members on duty.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
