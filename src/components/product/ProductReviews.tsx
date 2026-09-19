import { TbCircleCheckFilled, TbThumbUp } from "react-icons/tb";

import { Rating } from "@/components/ui/Rating";
import { EmptyState } from "@/components/ui/States";
import { getRatingBreakdown } from "@/helpers/product.helpers";
import { formatRelativeDate } from "@/lib/utils/format";
import type { Review } from "@/types";

/** Reviews are static per product, so the whole block renders on the server. */
export function ProductReviews({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}) {
  const breakdown = getRatingBreakdown(reviews);

  return (
    <section aria-labelledby="reviews-heading" className="space-y-6">
      <h2 id="reviews-heading" className="font-display text-xl font-semibold text-foreground">
        Customer reviews
      </h2>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="surface-card p-5 text-center">
            <p className="font-display text-4xl font-semibold text-foreground">{rating.toFixed(1)}</p>
            <Rating value={rating} showValue={false} className="mt-2 justify-center" />
            <p className="mt-2 text-xs text-muted">Based on {reviewCount.toLocaleString()} ratings</p>
          </div>

          <ul className="space-y-1.5">
            {breakdown.map((row) => (
              <li key={row.stars} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-8 tabular-nums">{row.stars} ★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-muted">
                  <span className="block h-full rounded-pill bg-accent-500" style={{ width: `${row.percent}%` }} />
                </span>
                <span className="w-8 text-right tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            title="No written reviews yet"
            description="This product has ratings but nobody has written a review. Be the first once it arrives."
          />
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="surface-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-full bg-brand-600/10 text-sm font-semibold text-brand-700 dark:text-brand-300">
                      {review.author.charAt(0)}
                    </span>
                    <div>
                      <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                        {review.author}
                        {review.verified && (
                          <TbCircleCheckFilled
                            className="size-3.5 text-success-500"
                            aria-label="Verified purchase"
                          />
                        )}
                      </p>
                      <p className="text-xs text-muted">{formatRelativeDate(review.createdAt)}</p>
                    </div>
                  </div>

                  <Rating value={review.rating} size="sm" showValue={false} />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-foreground">{review.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{review.body}</p>

                {review.helpfulCount > 0 && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
                    <TbThumbUp className="size-3.5" aria-hidden />
                    {review.helpfulCount} found this helpful
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
