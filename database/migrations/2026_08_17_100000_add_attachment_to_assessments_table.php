<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->string('attachment_path', 500)->nullable()->after('instructions');
            $table->string('attachment_name')->nullable()->after('attachment_path');
            $table->string('attachment_mime', 150)->nullable()->after('attachment_name');
            $table->unsignedBigInteger('attachment_size')->nullable()->after('attachment_mime');
        });
    }

    public function down(): void
    {
        Schema::table('assessments', fn (Blueprint $table) => $table->dropColumn([
            'attachment_path', 'attachment_name', 'attachment_mime', 'attachment_size',
        ]));
    }
};
