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
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('id')->primary(); // BOK-101 custom key index
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            
            $table->string('title');
            $table->string('client_name');
            $table->string('client_phone')->nullable();
            $table->string('client_email')->nullable();
            
            // Scheduling constraints
            $table->date('date');
            $table->string('start_time'); // Store HH:MM (e.g. "09:00")
            $table->string('end_time');   // Store HH:MM (e.g. "11:00")
            
            // Serialized mapping arrays
            $table->json('employee_ids')->nullable();  // Casts directly to JSON array or text arrays
            $table->json('equipment_ids')->nullable(); // Casts directly to JSON array or text arrays
            
            $table->text('notes')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
