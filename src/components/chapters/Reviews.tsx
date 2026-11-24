import reviews from '../../data/reviews.json';
import { isPlaceholder } from '../../lib/placeholder';
import { ChapterHeading } from '../ui/ChapterHeading';
import { Ph } from '../ui/Ph';

/** Chapter 8: reviews. All content is placeholder until the owner supplies verified reviews. */
export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="relative bg-charcoal-950 pb-28 pt-8 md:pb-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <ChapterHeading n="08" label="Reviews" jp="声" />
            <h2 id="reviews-title" className="display mt-5 text-[clamp(2.2rem,5vw,4.2rem)]">
              Word at the counter.
            </h2>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-5xl font-extrabold">
              <Ph value={reviews.googleRating} />
            </span>
            <span className="text-[13px] text-washi-50/60">
              on Google · <Ph value={reviews.reviewCount} /> reviews
            </span>
          </div>
        </div>

        <ul className="-mx-[var(--gutter)] mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5">
          {reviews.reviews.map((r) => (
            <li key={r.id} className="flex w-[80vw] max-w-sm shrink-0 snap-center flex-col rounded-3xl border border-washi-50/10 bg-charcoal-800/50 p-6 md:w-auto">
              <span aria-hidden="true" className="font-display text-5xl leading-none text-vermilion-600">
                “
              </span>
              <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-washi-50/80">
                <Ph value={r.text} />
              </blockquote>
              <p className="mt-6 text-[12px] text-washi-50/55">
                <Ph value={r.author} /> · {r.source}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] text-washi-50/55">
          {isPlaceholder(reviews.sourceUrl) ? (
            <>
              Read all reviews <span className="ph">{reviews.sourceUrl}</span>
            </>
          ) : (
            <a href={reviews.sourceUrl} target="_blank" rel="noopener" className="underline decoration-vermilion-600 underline-offset-4" data-cta="reviews_source">
              Read all reviews on Google
            </a>
          )}
        </p>
      </div>
    </section>
  );
}
