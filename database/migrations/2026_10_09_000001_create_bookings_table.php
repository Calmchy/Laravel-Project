<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique();
            $table->foreignId('passenger_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained('users')->cascadeOnDelete();
            $table->string('passenger_name', 120);
            $table->string('address');
            $table->string('email');
            $table->string('contact_number', 30);
            $table->unsignedTinyInteger('passenger_count');
            $table->string('pickup_location');
            $table->string('return_location');
            $table->dateTime('pickup_at');
            $table->dateTime('return_at');
            $table->decimal('fare', 10, 2);
            $table->enum('status', ['pending', 'accepted', 'declined', 'cancelled', 'completed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['driver_id', 'status']);
            $table->index(['passenger_id', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('bookings'); }
};
