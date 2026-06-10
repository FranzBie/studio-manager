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
        Schema::create('employees', function (Blueprint $table) {
            $table->string('id')->primary(); // Custom EMP-XXX keys
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            
            $table->string('name');
            $table->string('role');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('avatar_color')->default('#C54B2C');
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
