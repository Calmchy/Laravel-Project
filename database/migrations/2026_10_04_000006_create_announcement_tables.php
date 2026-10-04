<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcement_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 40)->unique();
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('announcement_categories');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete(); // exam venue city
            $table->string('title', 150);
            $table->text('body');
            $table->date('exam_date')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['category_id', 'exam_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('announcement_categories');
    }
};
