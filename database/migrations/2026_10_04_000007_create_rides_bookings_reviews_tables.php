<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The driver is reached through vehicle_id -> vehicles.driver_id, so
        // driver_id is deliberately NOT repeated here (keeps the table in 3NF).
        Schema::create('rides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles');
            $table->foreignId('announcement_id')->nullable()->constrained('announcements')->nullOnDelete();
            $table->foreignId('origin_city_id')->constrained('cities');
            $table->foreignId('destination_city_id')->constrained('cities');
            $table->string('pickup_point', 150);
            $table->string('dropoff_point', 150)->nullable();
            $table->dateTime('departure_at');
            $table->unsignedTinyInteger('seats_offered');
            $table->decimal('price_per_seat', 8, 2);
            $table->string('notes')->nullable();
            $table->enum('status', ['open', 'completed', 'cancelled'])->default('open');
            $table->timestamps();

            $table->index(['origin_city_id', 'destination_city_id', 'departure_at'], 'idx_rides_search');
        });

        // Lifecycle: pending (reservation) -> approved -> confirmed -> completed,
        // or cancelled. fare_per_seat is the price snapshot at booking time.
        // Seats left and total fare are derived by query, never stored.
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no', 25)->unique();
            $table->foreignId('ride_id')->constrained('rides');
            $table->foreignId('passenger_id')->constrained('users');
            $table->unsignedTinyInteger('seats_booked')->default(1);
            $table->decimal('fare_per_seat', 8, 2);
            $table->enum('status', ['pending', 'approved', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->timestamps(); // created_at = reservation time

            $table->unique(['ride_id', 'passenger_id']);
            $table->index(['passenger_id', 'status']);
        });

        // Reviewer/reviewee are derived from booking + reviewer_role.
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->enum('reviewer_role', ['passenger', 'driver']);
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['booking_id', 'reviewer_role']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE rides ADD CONSTRAINT chk_rides_route CHECK (origin_city_id <> destination_city_id)');
            DB::statement('ALTER TABLE rides ADD CONSTRAINT chk_rides_seats CHECK (seats_offered >= 1)');
            DB::statement('ALTER TABLE rides ADD CONSTRAINT chk_rides_price CHECK (price_per_seat >= 0)');
            DB::statement('ALTER TABLE bookings ADD CONSTRAINT chk_bookings_seats CHECK (seats_booked >= 1)');
            DB::statement('ALTER TABLE bookings ADD CONSTRAINT chk_bookings_fare CHECK (fare_per_seat >= 0)');
            DB::statement('ALTER TABLE reviews ADD CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('rides');
    }
};
