<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QualityControl extends Model
{
    use HasFactory;

    protected $table = 'quality_controls';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'factory_id',
        'subcontract_post_id',
        'roll_no',
        'machine_code',
        'inspection_date',
        'weight_kg',
        'status',
        'issue_type',
        'resolution',
        'inspector_name',
        'notes',
        'created_by_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'inspection_date' => 'date',
            'weight_kg' => 'decimal:2',
        ];
    }

    /**
     * Factory where inspection was performed.
     */
    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    /**
     * Related subcontract order if applicable.
     */
    public function subcontractPost(): BelongsTo
    {
        return $this->belongsTo(SubcontractPost::class);
    }

    /**
     * User who logged the QC entry.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
