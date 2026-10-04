<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 20)->unique();
        });

        // Reference data the app depends on (ids 1, 2, 3 must stay fixed:
        // see App\Models\Role constants). Inserted here so the users
        // migration below can safely default existing users to "passenger".
        DB::table('roles')->insert([
            ['name' => 'admin'],
            ['name' => 'driver'],
            ['name' => 'passenger'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
