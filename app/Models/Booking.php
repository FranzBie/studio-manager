<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Booking extends Model
{
    use HasFactory;

    /**
     * Set incremental binding indicator to false.
     * We use preselected alphanumeric IDs like BOK-XXX.
     */
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Writable parameters allowed for mass-assignment.
     */
    protected $fillable = [
        'id',
        'tenant_id',
        'title',
        'client_name',
        'client_phone',
        'client_email',
        'date',
        'start_time',
        'end_time',
        'employee_ids',
        'equipment_ids',
        'notes',
        'status',
    ];

    /**
     * Automatic cast transformations for DB JSON array conversions.
     */
    protected $casts = [
        'employee_ids' => 'array',
        'equipment_ids' => 'array',
        'date' => 'date:Y-m-d',
    ];

    /**
     * The "booted" method of the model.
     * Automatically binds creating events and enforces global tenant isolation queries.
     */
    protected static function booted()
    {
        static::creating(function ($booking) {
            if (request()->headers->has('X-Tenant-ID')) {
                $booking->tenant_id = request()->header('X-Tenant-ID');
            } elseif (session()->has('tenant_id')) {
                $booking->tenant_id = session()->get('tenant_id');
            }
        });

        static::addGlobalScope('tenant_scope', function (Builder $builder) {
            if (request()->headers->has('X-Tenant-ID')) {
                $builder->where('tenant_id', request()->header('X-Tenant-ID'));
            } elseif (session()->has('tenant_id')) {
                $builder->where('tenant_id', session()->get('tenant_id'));
            }
        });
    }

    /**
     * Relationship: A booking belongs to a specific tenant (creative studio).
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope: Select active sessions which haven't been cancelled.
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'cancelled');
    }

    /**
     * Scope: Filter by a particular scheduled date.
     */
    public function scopeOnDate($query, $date)
    {
        return $query->where('date', $date);
    }
}
