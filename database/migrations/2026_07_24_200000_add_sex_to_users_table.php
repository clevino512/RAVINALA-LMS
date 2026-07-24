<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'sex')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('sex', 20)->nullable()->after('date_of_birth');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'sex')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('sex');
            });
        }
    }
};
