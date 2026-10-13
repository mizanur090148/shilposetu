<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FactoryShift extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'shift_id',
        'name',
        'code',
        'start_time',
        'end_time',
        'duration_hours',
        'in_charge',
        'target_output_kg',
        'is_active',
        'sort_order',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_hours' => 'float',
            'target_output_kg' => 'float',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Owning factory.
     */
    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    /**
     * Master shift.
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    /**
     * Shift production records.
     */
    public function productions(): HasMany
    {
        return $this->hasMany(Production::class);
    }
}
