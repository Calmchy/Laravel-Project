<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('passenger')->index();
            $table->string('address')->nullable();
            $table->string('contact_number', 30)->nullable();
            $table->string('identity_document_path')->nullable();
            $table->string('identity_status')->default('unverified');
            $table->string('driver_status')->default('pending');
            $table->string('vehicle_type')->nullable();
            $table->string('vehicle_plate', 30)->nullable();
            $table->unsignedTinyInteger('seats')->nullable();
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role','address','contact_number','identity_document_path','identity_status','driver_status','vehicle_type','vehicle_plate','seats']);
        });
    }
};
