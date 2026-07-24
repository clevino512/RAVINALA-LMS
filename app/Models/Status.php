<?php

namespace App\Models;

use Database\Factories\StatusFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Status extends Model
{
    /** @use HasFactory<StatusFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'status';

    protected $fillable = ['name', 'created_at'];

    protected $casts = ['created_at' => 'string'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'id_status');
    }
}
