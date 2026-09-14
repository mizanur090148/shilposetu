<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quotation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'subcontract_post_id',
        'bidder_user_id',
        'bidder_factory_id',
        'offered_unit_price',
        'offered_lead_days',
        'offered_total_cost',
        'note',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'offered_unit_price' => 'decimal:2',
            'offered_lead_days' => 'integer',
            'offered_total_cost' => 'decimal:2',
        ];
    }

    /**
     * Target subcontract post.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(SubcontractPost::class, 'subcontract_post_id');
    }

    /**
     * Bidder user.
     */
    public function bidderUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bidder_user_id');
    }

    /**
     * Bidder factory.
     */
    public function bidderFactory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'bidder_factory_id');
    }
}
