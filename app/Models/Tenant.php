<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'plan', // 'basic', 'pro', 'enterprise'
        'plan_status', // 'active', 'past_due', 'trialing'
        'max_staff', // Plan quota limit
        'max_equipment', // Plan quota limit
        'max_monthly_bookings', // Plan quota limit
        'stripe_id',
        'card_brand',
        'card_last_four',
    ];

    /**
     * Scope filter for active subscribed accounts.
     */
    public function scopeSubscribed($query)
    {
        return $query->whereIn('plan_status', ['active', 'trialing']);
    }

    /**
     * Relationship: Bookings scheduled by this tenant.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Relationship: Staff members belonging to this studio workspace.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * Relationship: Equipment inventory allocated to this studio workspace.
     */
    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    /**
     * SaaS business rule: check if staff quota has been exceeded.
     */
    public function canAddStaff(): bool
    {
        return $this->employees()->count() < $this->max_staff;
    }

    /**
     * SaaS business rule: check if equipment quota has been exceeded.
     */
    public function canAddEquipment(): bool
    {
        return $this->equipment()->count() < $this->max_equipment;
    }

    /**
     * SaaS business rule: check if monthly bookings limit for this billing cycle is reached.
     */
    public function canAddBooking(): bool
    {
        $currentMonthBookings = $this->bookings()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return $currentMonthBookings < $this->max_monthly_bookings;
    }
}
