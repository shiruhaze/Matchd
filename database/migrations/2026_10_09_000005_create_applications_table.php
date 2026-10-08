<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('applicant_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending'); // pending | under_review | interview_scheduled | declined
            $table->timestamp('viewed_at')->nullable();
            $table->timestamps();

            $table->unique(['job_post_id', 'applicant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
