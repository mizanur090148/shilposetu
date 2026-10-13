<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Production extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'subcontract_post_id',
        'machine_id',
        'machine_code',
        'factory_shift_id',
        'shift_code',
        'production_date',
        'quantity_kg',
        'rolls_count',
        'operator_name',
        'yarn_lot',
        'quality_issue',
        'notes',
        'created_by_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'production_date' => 'date',
            'quantity_kg' => 'float',
            'rolls_count' => 'integer',
        ];
    }

    /**
     * Factory where production took place.
     */
    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    /**
     * Associated subcontract order/job.
     */
    public function subcontractPost(): BelongsTo
    {
        return $this->belongsTo(SubcontractPost::class);
    }

    /**
     * Associated machine.
     */
    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    /**
     * Factory shift.
     */
    public function factoryShift(): BelongsTo
    {
        return $this->belongsTo(FactoryShift::class);
    }

    /**
     * User who logged the production.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
