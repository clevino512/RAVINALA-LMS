<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'id_2')) {
                $table->dropForeign(['id_2']);
            }
            if (Schema::hasColumn('users', 'id_1')) {
                $table->dropForeign(['id_1']);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'id_1')) {
                $table->renameColumn('id_1', 'id_type');
            }
            if (Schema::hasColumn('users', 'id_2')) {
                $table->renameColumn('id_2', 'id_status');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'id_type')) {
                $table->foreign('id_type')->references('id')->on('user_type');
            }
            if (Schema::hasColumn('users', 'id_status')) {
                $table->foreign('id_status')->references('id')->on('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'id_status')) {
                $table->dropForeign(['id_status']);
            }
            if (Schema::hasColumn('users', 'id_type')) {
                $table->dropForeign(['id_type']);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'id_type')) {
                $table->renameColumn('id_type', 'id_1');
            }
            if (Schema::hasColumn('users', 'id_status')) {
                $table->renameColumn('id_status', 'id_2');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'id_1')) {
                $table->foreign('id_1')->references('id')->on('user_type');
            }
            if (Schema::hasColumn('users', 'id_2')) {
                $table->foreign('id_2')->references('id')->on('status');
            }
        });
    }
};
