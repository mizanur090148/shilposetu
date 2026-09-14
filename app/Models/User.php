<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'customer_id',
        'name',
        'email',
        'phone',
        'password',
        'account_type',
        'status',
        'phone_verified_at',
        'nid_number',
        'is_subscribed',
        'subscription_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'is_subscribed' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Get associated factory profile.
     */
    public function factory(): HasOne
    {
        return $this->hasOne(Factory::class);
    }

    /**
     * Get subcontract posts created by this user.
     */
    public function subcontractPosts(): HasMany
    {
        return $this->hasMany(SubcontractPost::class);
    }

    /**
     * Get quotations submitted by this user.
     */
    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class, 'bidder_user_id');
    }

    /**
     * Get user subscriptions.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Check if user has active paid subscription.
     */
    public function hasActiveSubscription(): bool
    {
        return (bool) $this->is_subscribed;
    }
}
