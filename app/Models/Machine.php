<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Machine extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'machine_type_id',
        'cph',
        'unit',
        'brand_or_model',
        'serial_number',
        'is_active',
        'sort_order',
        'created_by_id',
        'updated_by_id',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cph' => 'decimal:2',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'created_by_id' => 'integer',
            'updated_by_id' => 'integer',
        ];
    }

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $machine) {
            if (empty($machine->created_by_id) && Auth::check()) {
                $machine->created_by_id = Auth::id();
            }
        });

        static::updating(function (self $machine) {
            if (Auth::check()) {
                $machine->updated_by_id = Auth::id();
            }
        });
    }

    /**
     * Scope query to only active machines.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * The machine type category this machine belongs to.
     */
    public function machineType(): BelongsTo
    {
        return $this->belongsTo(MachineType::class);
    }

    /**
     * The user who created this machine record.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * The user who last updated this machine record.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_id');
    }
}
