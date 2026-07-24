<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            $this->restoreUserForeignKeyNames();
        }

        if (Schema::hasTable('permissions') && ! Schema::hasColumn('permissions', 'description')) {
            Schema::table('permissions', function (Blueprint $table) {
                $table->text('description')->nullable()->after('name');
            });
        }

        if (! Schema::hasTable('user_permissions')) {
            Schema::create('user_permissions', function (Blueprint $table) {
                $table->foreignId('users_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('permissions_id')->constrained('permissions')->cascadeOnDelete();
                $table->primary(['users_id', 'permissions_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_permissions');
    }

    private function restoreUserForeignKeyNames(): void
    {
        $hasOldType = Schema::hasColumn('users', 'id_type');
        $hasOldStatus = Schema::hasColumn('users', 'id_status');

        if ($hasOldType || $hasOldStatus) {
            Schema::table('users', function (Blueprint $table) use ($hasOldType, $hasOldStatus) {
                if ($hasOldType) {
                    $table->dropForeign(['id_type']);
                }

                if ($hasOldStatus) {
                    $table->dropForeign(['id_status']);
                }
            });
        }

        if ($hasOldType) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('id_type', 'id_1');
            });
        }

        if ($hasOldStatus) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('id_status', 'id_2');
            });
        }

        if ($hasOldType || $hasOldStatus) {
            Schema::table('users', function (Blueprint $table) use ($hasOldType, $hasOldStatus) {
                if ($hasOldType) {
                    $table->foreign('id_1')->references('id')->on('user_type');
                }

                if ($hasOldStatus) {
                    $table->foreign('id_2')->references('id')->on('status');
                }
            });
        }
    }
};
