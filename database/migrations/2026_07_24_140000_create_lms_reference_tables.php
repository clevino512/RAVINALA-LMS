<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('status', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->nullable();
            $table->string('created_at', 50)->nullable();
        });

        Schema::create('user_type', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->nullable();
            $table->text('description')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->string('updated_at', 50)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_type');
        Schema::dropIfExists('status');
    }
};
