<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubcontractPost extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'factory_id',
        'accepted_factory_id',
        'post_type',
        'category',
        'title',
        'target_quantity',
        'unit',
        'target_rate',
        'rate_negotiable',
        'deadline',
        'district',
        'address',
        'description',
        'specs',
        'tech_pack_file',
        'product_images',
        'is_urgent',
        'status',
        'views_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_quantity' => 'integer',
            'target_rate' => 'decimal:2',
            'rate_negotiable' => 'boolean',
            'is_urgent' => 'boolean',
            'deadline' => 'date',
            'specs' => 'array',
            'product_images' => 'array',
            'views_count' => 'integer',
        ];
    }

    /**
     * Post author user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Associated factory/plant.
     */
    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    /**
     * Accepted/awarded subcontractor factory for this order.
     */
    public function acceptedFactory(): BelongsTo
    {
        return $this->belongsTo(Factory::class, 'accepted_factory_id');
    }

    /**
     * Quotations received on this post.
     */
    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }
}
