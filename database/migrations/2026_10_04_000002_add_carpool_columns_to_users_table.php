<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Reuses the existing `users` table (Fortify, passkeys, 2FA, sessions all keep
 * working). We keep the single `name` column and only ADD carpool columns.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Existing users become passengers (role id 3); admins are set manually.
            $table->foreignId('role_id')->default(3)->after('id')->constrained('roles');
            $table->string('phone_number', 20)->nullable()->after('email');
            $table->string('profile_photo_path')->nullable()->after('password');
            $table->enum('account_status', ['active', 'suspended'])->default('active')->after('profile_photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
            $table->dropColumn(['phone_number', 'profile_photo_path', 'account_status']);
        });
    }
};
