<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Equipment extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string'; // EQ-XXX keys

    protected $fillable = [
        'id',
        'tenant_id',
        'name',
        'category',
        'serial_number',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    /**
     * Relationship: Equipment belongs to a specific tenant / studio workspace.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope: Filter available items physically in storage.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }
}
