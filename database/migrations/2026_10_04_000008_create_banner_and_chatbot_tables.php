<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 100);
            $table->string('caption')->nullable();
            $table->string('image_path');
            $table->string('link_url')->nullable();
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'display_order']);
        });

        // One intent -> many keywords (no comma-separated lists).
        Schema::create('chatbot_intents', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60)->unique();
            $table->text('answer');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('chatbot_keywords', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intent_id')->constrained('chatbot_intents')->cascadeOnDelete();
            $table->string('keyword', 100)->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_keywords');
        Schema::dropIfExists('chatbot_intents');
        Schema::dropIfExists('banners');
    }
};
