<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactoryMachine extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'factory_machines';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'machine_type_id',
        'category',
        'no_of_machine',
        'capacity_per_machine',
        'total_capacity_per_day',
        'unit_type',
        'sort_order',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'no_of_machine' => 'integer',
            'capacity_per_machine' => 'decimal:2',
            'total_capacity_per_day' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Factory associated with this machine assignment.
     */
    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    /**
     * Master machine type details (name, brand/model, standard specs).
     */
    public function machineType(): BelongsTo
    {
        return $this->belongsTo(MachineType::class);
    }
}
