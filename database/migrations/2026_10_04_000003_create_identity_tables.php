<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('id_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60)->unique();
        });

        // Valid-ID uploads. "ID verified" is derived from an approved row here,
        // so no is_verified flag is stored on users.
        Schema::create('identity_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('id_type_id')->constrained('id_types');
            $table->string('front_image_path');
            $table->string('back_image_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identity_documents');
        Schema::dropIfExists('id_types');
    }
};
