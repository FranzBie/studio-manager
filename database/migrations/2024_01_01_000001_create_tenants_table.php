<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            
            // SaaS subscription properties
            $table->string('plan')->default('basic'); // 'basic', 'pro', 'enterprise'
            $table->string('plan_status')->default('active'); // 'active', 'trialing', 'past_due'
            
            // Limit counters (enforceable quotas)
            $table->integer('max_staff')->default(3);
            $table->integer('max_equipment')->default(5);
            $table->integer('max_monthly_bookings')->default(15);
            
            // Mock Billing metadata handles if necessary
            $table->string('stripe_id')->nullable();
            $table->string('card_brand')->nullable();
            $table->string('card_last_four')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
