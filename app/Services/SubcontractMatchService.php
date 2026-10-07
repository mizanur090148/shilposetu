<?php

namespace App\Services;

use App\Models\Factory;
use App\Models\KnittingType;
use App\Models\SubcontractPost;
use App\Models\User;
use App\Notifications\NewSubcontractMatchNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SubcontractMatchService
{
    /**
     * Find all matching factories for a subcontract post.
     *
     * @return Collection<int, array{factory: Factory, user: User, score: int, match_reason: string}>
     */
    public function findMatchingFactories(SubcontractPost $post): Collection
    {
        // Only DEMAND posts notify potential suppliers / factories
        if ($post->post_type !== 'DEMAND') {
            return collect();
        }

        // Candidate factories: must have an active user, and cannot be the post creator
        $candidates = Factory::query()
            ->with(['user', 'knittingTypes', 'machines'])
            ->whereNotNull('user_id')
            ->where('user_id', '!=', $post->user_id)
            ->whereHas('user', function ($uq) {
                $uq->where('status', 'active');
            })
            ->get();

        if ($candidates->isEmpty()) {
            return collect();
        }

        $categorySlug = Str::slug($post->category);
        $postCategoryLower = strtolower($post->category);
        $postTitleLower = strtolower($post->title);
        $postDescLower = strtolower($post->description ?? '');
        $postDistrict = trim(strtolower($post->district ?? ''));

        // Look up if post category corresponds to a KnittingType
        $matchingKnittingType = KnittingType::where('slug', $categorySlug)
            ->orWhere('name', 'like', "%{$postCategoryLower}%")
            ->first();

        $isKnittingOperation = (bool) $matchingKnittingType
            || str_contains($postCategoryLower, 'knit')
            || str_contains($postTitleLower, 'knit')
            || str_contains($postDescLower, 'knit');

        $isDyeingOperation = str_contains($postCategoryLower, 'dyeing') || str_contains($postTitleLower, 'dyeing');
        $isPrintOperation = str_contains($postCategoryLower, 'print') || str_contains($postTitleLower, 'print');
        $isEmbroideryOperation = str_contains($postCategoryLower, 'embroidery') || str_contains($postTitleLower, 'embroidery');
        $isSewingOperation = str_contains($postCategoryLower, 'sewing') || str_contains($postCategoryLower, 'garment') || str_contains($postTitleLower, 'sewing');

        $scoredFactories = collect();

        foreach ($candidates as $factory) {
            $score = 0;
            $reasons = [];

            // 1. Knitting Type / Exact Specialization match (Highest Priority)
            if ($matchingKnittingType && $factory->knittingTypes->contains('id', $matchingKnittingType->id)) {
                $score += 50;
                $reasons[] = "স্পেশালাইজেশন ({$matchingKnittingType->name})";
            } elseif ($factory->knittingTypes->isNotEmpty()) {
                // Check if factory has any knitting type mentioned in title/category/description
                foreach ($factory->knittingTypes as $kt) {
                    if (
                        str_contains($postTitleLower, strtolower($kt->name)) ||
                        str_contains($postDescLower, strtolower($kt->name)) ||
                        str_contains($categorySlug, $kt->slug)
                    ) {
                        $score += 45;
                        $reasons[] = "নিটিং ধরন ({$kt->name})";
                        break;
                    }
                }
            }

            // 2. Machine Department match (from factory_machines)
            if (!empty($factory->machines)) {
                foreach ($factory->machines as $machine) {
                    $mCat = strtolower($machine->category ?? '');
                    if (
                        ($isKnittingOperation && $mCat === 'knitting') ||
                        ($isDyeingOperation && str_contains($mCat, 'dyeing')) ||
                        ($isPrintOperation && $mCat === 'print') ||
                        ($isEmbroideryOperation && $mCat === 'embroidery') ||
                        $mCat === $postCategoryLower ||
                        str_contains($postCategoryLower, $mCat)
                    ) {
                        $score += 35;
                        $reasons[] = "মেশিন সক্ষমতা (" . ucfirst(str_replace('_', ' ', $mCat)) . ")";
                        break;
                    }
                }
            }

            // 3. Industry Type affinity
            $indType = strtolower($factory->industry_type ?? '');
            if (
                ($isKnittingOperation && (str_contains($indType, 'knit') || str_contains($indType, 'textile') || str_contains($indType, 'apparel') || str_contains($indType, 'garment'))) ||
                ($isDyeingOperation && (str_contains($indType, 'dyeing') || str_contains($indType, 'textile'))) ||
                ($isPrintOperation && (str_contains($indType, 'print') || str_contains($indType, 'embroidery'))) ||
                ($isEmbroideryOperation && (str_contains($indType, 'embroidery') || str_contains($indType, 'print'))) ||
                ($isSewingOperation && (str_contains($indType, 'garment') || str_contains($indType, 'woven') || str_contains($indType, 'knit')))
            ) {
                $score += 25;
                if (empty($reasons)) {
                    $reasons[] = "ইন্ডাস্ট্রি ({$factory->industry_type})";
                }
            }

            // 4. District / Location Match
            $fDistrict = trim(strtolower($factory->district ?? ''));
            if (!empty($postDistrict) && !empty($fDistrict) && $postDistrict === $fDistrict) {
                $score += 25;
                $reasons[] = "একই এলাকা ({$factory->district})";
            }

            // 5. Verified Factory Bonus
            if ($factory->is_verified) {
                $score += 10;
            }

            // Qualification threshold: score >= 25
            if ($score >= 25) {
                $matchReasonStr = !empty($reasons) ? implode(' • ', $reasons) : 'উৎপাদন সক্ষমতা মিল';
                $scoredFactories->push([
                    'factory' => $factory,
                    'user' => $factory->user,
                    'score' => $score,
                    'match_reason' => $matchReasonStr,
                ]);
            }
        }

        // Fallback: If no factories scored >= 25, fallback to all active garment/textile factories
        if ($scoredFactories->isEmpty() && $candidates->isNotEmpty()) {
            foreach ($candidates as $factory) {
                $fDistrict = trim(strtolower($factory->district ?? ''));
                $isLocal = (!empty($postDistrict) && $fDistrict === $postDistrict);
                $scoredFactories->push([
                    'factory' => $factory,
                    'user' => $factory->user,
                    'score' => $isLocal ? 40 : 20,
                    'match_reason' => $isLocal ? "একই এলাকা ({$factory->district})" : 'সক্রিয় টেক্সটাইল নেটওয়ার্ক ম্যাচ',
                ]);
            }
        }

        return $scoredFactories->sortByDesc('score')->values();
    }

    /**
     * Send in-app and email notifications to all matched factories.
     */
    public function notifyMatchingFactories(SubcontractPost $post): int
    {
        try {
            $matches = $this->findMatchingFactories($post);

            if ($matches->isEmpty()) {
                Log::info("No matching factories found for subcontract post #{$post->id}");
                return 0;
            }

            $count = 0;
            foreach ($matches as $match) {
                $user = $match['user'];
                $reason = $match['match_reason'];

                if (!$user) {
                    continue;
                }

                try {
                    $user->notify(new NewSubcontractMatchNotification($post, $reason));
                    $count++;
                } catch (\Throwable $e) {
                    Log::error("Failed to notify user #{$user->id} for post #{$post->id}: " . $e->getMessage());
                }
            }

            Log::info("Successfully sent match notifications to {$count} factories for subcontract post #{$post->id} ('{$post->title}')");
            return $count;
        } catch (\Throwable $e) {
            Log::error("Error in notifyMatchingFactories for post #{$post->id}: " . $e->getMessage());
            return 0;
        }
    }
}
