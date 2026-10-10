import { Link } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export type Slide = {
    id: string;
    kind: 'banner' | 'event';
    title: string;
    caption: string | null;
    link_url: string;
    image_url: string | null;
};

/** Gradients (built from the brand palette) for slides that have no photo, e.g. exam events. */
const GRADIENTS = [
    'from-teal-brand via-deep-2 to-deep',
    'from-coral/90 via-deep-2 to-deep',
    'from-seafoam/70 via-teal-brand to-deep',
    'from-sand/80 via-teal-brand to-deep',
];

/**
 * Header slideshow for the dashboard.
 *  - AUTOMATIC: advances every 6 seconds.
 *  - CLICKABLE: the whole slide is a link; arrows and dots jump between slides.
 *  - Pauses on hover/focus, and never auto-plays for people who prefer reduced motion.
 */
export default function DashboardSlideshow({ slides }: { slides: Slide[] }) {
    const [i, setI] = useState(0);
    const [paused, setPaused] = useState(false);
    const count = slides.length;

    // Wrap-around navigation (so "previous" on slide 0 goes to the last slide)
    const go = (n: number) => setI((n + count) % count);

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (paused || reduce || count < 2) {
            return;
        }

        // Restarted whenever `i` changes, so a manual click gives a full 6s on the new slide.
        const t = setTimeout(() => setI((n) => (n + 1) % count), 6000);

        return () => clearTimeout(t);
    }, [i, paused, count]);

    if (count === 0) {
        return null;
    }

    return (
        <section
            className="relative h-56 w-full overflow-hidden rounded-3xl bg-deep shadow-lg md:h-72"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="Announcements and events"
        >
            {slides.map((s, idx) => (
                <Link
                    key={s.id}
                    href={s.link_url}
                    aria-hidden={idx !== i}
                    tabIndex={idx === i ? 0 : -1}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                >
                    {s.image_url ? (
                        <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 max-w-xl pr-16 md:left-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white">
                            {s.kind === 'event' && <CalendarDays className="size-3.5" />}
                            {s.kind === 'event' ? 'Exam / event' : 'Announcement'}
                        </span>
                        <h2 className="mt-2 font-serif text-2xl text-white md:text-4xl">{s.title}</h2>
                        {s.caption && <p className="mt-1 text-sm text-peach md:text-base">{s.caption}</p>}
                    </div>
                </Link>
            ))}

            {count > 1 && (
                <>
                    <button type="button" onClick={() => go(i - 1)} aria-label="Previous slide" className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-deep/50 p-2 text-white backdrop-blur transition hover:bg-deep/80">
                        <ChevronLeft className="size-5" />
                    </button>
                    <button type="button" onClick={() => go(i + 1)} aria-label="Next slide" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-deep/50 p-2 text-white backdrop-blur transition hover:bg-deep/80">
                        <ChevronRight className="size-5" />
                    </button>
                    <div className="absolute right-6 bottom-5 flex gap-2" role="tablist">
                        {slides.map((s, idx) => (
                            <button
                                key={s.id}
                                type="button"
                                role="tab"
                                aria-selected={idx === i}
                                aria-label={`Show slide ${idx + 1}`}
                                onClick={() => setI(idx)}
                                className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-8 bg-sand' : 'w-3 bg-white/50 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
