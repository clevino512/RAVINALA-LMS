<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->date('date_of_birth')->nullable()->after('email');
            $table->string('phone_number')->nullable()->after('date_of_birth');
            $table->string('profile_picture')->nullable()->after('phone_number');
            $table->boolean('must_change_password')->default(true)->after('password');
            $table->timestamp('last_login_at')->nullable()->after('must_change_password');
            $table->foreignId('id_1')->nullable()->after('remember_token')->constrained('user_type');
            $table->foreignId('id_2')->nullable()->after('id_1')->constrained('status');
        });

        DB::table('users')
            ->whereNull('first_name')
            ->update([
                'first_name' => DB::raw('name'),
                'last_name' => '',
            ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_2');
            $table->dropConstrainedForeignId('id_1');
            $table->dropColumn([
                'first_name',
                'last_name',
                'date_of_birth',
                'phone_number',
                'profile_picture',
                'must_change_password',
                'last_login_at',
            ]);
        });
    }
};
