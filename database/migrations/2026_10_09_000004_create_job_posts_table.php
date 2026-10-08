<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('employment_type')->default('full-time');
            $table->string('work_setup')->default('remote');
            $table->string('location')->nullable();
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->string('status')->default('draft'); // draft | published | closed
            $table->timestamps();
        });

        Schema::create('job_post_skill', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->unique(['job_post_id', 'skill_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_post_skill');
        Schema::dropIfExists('job_posts');
    }
};
