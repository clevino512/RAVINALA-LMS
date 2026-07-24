<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'email_verified_at',
        'date_of_birth',
        'sex',
        'phone_number',
        'profile_picture',
        'password',
        'must_change_password',
        'last_login_at',
        'id_1',
        'id_2',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /** @var list<string> */
    protected $appends = ['name'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date:Y-m-d',
            'last_login_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
        ];
    }

    protected function name(): Attribute
    {
        return Attribute::get(fn () => trim($this->first_name.' '.($this->last_name ?? '')));
    }

    public function userType(): BelongsTo
    {
        return $this->belongsTo(UserType::class, 'id_1');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'id_2');
    }

    public function customPermissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_permissions', 'users_id', 'permissions_id');
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class);
    }

    public function hasUserType(string $type): bool
    {
        return mb_strtolower((string) $this->userType?->name) === mb_strtolower($type);
    }

    public function dashboardRouteName(): string
    {
        return match (mb_strtolower((string) $this->userType?->name)) {
            'admin', 'administrateur' => 'admin.dashboard',
            'professeur', 'teacher' => 'professeur.dashboard',
            default => 'etudiant.dashboard',
        };
    }
}
