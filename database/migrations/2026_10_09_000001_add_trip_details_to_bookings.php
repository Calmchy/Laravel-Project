<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Booking form data + map coordinates.
 *
 * - bookings: the "fill out form" the passenger completes when reserving (contact details,
 *   pick-up / return place + date). Coordinates come from the map picker (nullable: typing an
 *   address without touching the map is still allowed).
 * - cities: a centre point per city so the map opens on the right area.
 * The price is NOT a new column: bookings.fare_per_seat already snapshots the rate.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('contact_name', 100)->nullable()->after('passenger_id');
            $table->string('contact_address', 200)->nullable()->after('contact_name');
            $table->string('contact_email', 150)->nullable()->after('contact_address');
            $table->string('contact_phone', 20)->nullable()->after('contact_email');

            $table->string('pickup_location', 200)->nullable()->after('contact_phone');
            $table->decimal('pickup_lat', 10, 7)->nullable()->after('pickup_location');
            $table->decimal('pickup_lng', 10, 7)->nullable()->after('pickup_lat');
            $table->dateTime('pickup_at')->nullable()->after('pickup_lng');

            $table->string('return_location', 200)->nullable()->after('pickup_at');
            $table->decimal('return_lat', 10, 7)->nullable()->after('return_location');
            $table->decimal('return_lng', 10, 7)->nullable()->after('return_lat');
            $table->dateTime('return_at')->nullable()->after('return_lng');
        });

        Schema::table('cities', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('cities', fn (Blueprint $t) => $t->dropColumn(['latitude', 'longitude']));
        Schema::table('bookings', fn (Blueprint $t) => $t->dropColumn([
            'contact_name', 'contact_address', 'contact_email', 'contact_phone',
            'pickup_location', 'pickup_lat', 'pickup_lng', 'pickup_at',
            'return_location', 'return_lat', 'return_lng', 'return_at',
        ]));
    }
};
