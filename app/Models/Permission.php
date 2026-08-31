<?php

namespace App\Models;

use Database\Factories\PermissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    /** @use HasFactory<PermissionFactory> */
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function customUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_permissions', 'permissions_id', 'users_id');
    }
}
