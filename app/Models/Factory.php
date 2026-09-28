<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Factory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'business_name',
        'logo',
        'industry_type',
        'contact_person',
        'phone',
        'email',
        'district',
        'address',
        'total_machines',
        'daily_capacity',
        'trade_license_no',
        'trade_license_file',
        'tin_no',
        'tin_file',
        'bin_no',
        'bin_file',
        'nid_file',
        'is_verified',
        'capabilities',
        'production_capacities',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_machines' => 'integer',
            'is_verified' => 'boolean',
            'capabilities' => 'array',
            'production_capacities' => 'array',
        ];
    }

    /**
     * Factory owner.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Subcontract posts published by this factory.
     */
    public function subcontractPosts(): HasMany
    {
        return $this->hasMany(SubcontractPost::class);
    }

    /**
     * Quotations submitted by this factory.
     */
    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class, 'bidder_factory_id');
    }

    /**
     * Knitting types handled by this factory.
     */
    public function knittingTypes(): BelongsToMany
    {
        return $this->belongsToMany(KnittingType::class, 'factory_knitting_types')->withTimestamps();
    }

    /**
     * Machinery roster installed in this factory.
     */
    public function machines(): HasMany
    {
        return $this->hasMany(FactoryMachine::class)->orderBy('category')->orderBy('sort_order');
    }
}
