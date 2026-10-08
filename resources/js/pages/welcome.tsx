import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, CalendarCheck, Car, Search, Star } from 'lucide-react';
import { useState } from 'react';
import BannerSlideshow from '@/components/banner-slideshow';
import type { Banner } from '@/components/banner-slideshow';
import { fmtDate } from '@/components/lux';
import RideCard from '@/components/ride-card';
import type { RideCardData } from '@/components/ride-card';
import SiteHeader from '@/components/site-header';

type City = { id: number; name: string };
type Announcement = {
    id: number;
    title: string;
    category: string;
    city: string | null;
    city_id: number | null;
    exam_date: string | null;
};

type Props = {
    banners: Banner[];
    cities: City[];
    rides: RideCardData[];
    announcements: Announcement[];
};

const STEPS = [
    { icon: BadgeCheck, title: 'Verify your ID', text: 'Upload a valid ID once. An admin checks it so everyone on board is accountable.' },
    { icon: Search, title: 'Find a ride', text: 'Search by origin, destination and date, then reserve the seats you need.' },
    { icon: CalendarCheck, title: 'Driver approves', text: 'The driver accepts your request and you confirm. You get a reference number.' },
    { icon: Star, title: 'Ride and review', text: 'Pay cash on the ride, then rate each other to keep the community trusted.' },
];

const field =
    'w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300 [color-scheme:dark]';

export default function Welcome({ banners, cities, rides, announcements }: Props) {
    const [q, setQ] = useState({ origin: '', destination: '', date: '' });

    // Send only the filled-in fields; the server validates them again.
    const search = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/rides', Object.fromEntries(Object.entries(q).filter(([, v]) => v)));
    };

    return (
        <>
            <Head title="Affordable shared rides across the Philippines" />
            <div className="min-h-screen bg-slate-950 text-white">
                <SiteHeader />
                <BannerSlideshow banners={banners} />

                {/* Search card floats over the bottom edge of the slideshow */}
                <form
                    onSubmit={search}
                    className="relative z-20 mx-auto -mt-20 grid max-w-5xl gap-3 rounded-3xl border border-amber-300/20 bg-slate-900/80 p-5 shadow-2xl backdrop-blur md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                    <select aria-label="From" value={q.origin} onChange={(e) => setQ({ ...q, origin: e.target.value })} className={field}>
                        <option value="">From: anywhere</option>
                        {cities.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select aria-label="To" value={q.destination} onChange={(e) => setQ({ ...q, destination: e.target.value })} className={field}>
                        <option value="">To: anywhere</option>
                        {cities.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <input aria-label="Date" type="date" value={q.date} onChange={(e) => setQ({ ...q, date: e.target.value })} className={field} />
                    <button className="rounded-xl bg-amber-300 px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">
                        Search rides
                    </button>
                </form>

                <main className="mx-auto max-w-7xl space-y-24 px-5 py-24">
                    <section>
                        <div className="mb-8 flex items-end justify-between">
                            <h2 className="font-serif text-4xl">Upcoming rides</h2>
                            <Link href="/rides" className="text-sm text-amber-300 hover:underline">See all →</Link>
                        </div>
                        {rides.length ? (
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {rides.map((r) => <RideCard key={r.id} ride={r} />)}
                            </div>
                        ) : (
                            <p className="rounded-2xl border border-white/10 p-10 text-center text-white/60">
                                No rides posted yet. Be the first driver to offer seats.
                            </p>
                        )}
                    </section>

                    {announcements.length > 0 && (
                        <section>
                            <h2 className="mb-8 font-serif text-4xl">Exam schedules and notices</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {announcements.map((a) => (
                                    <Link
                                        key={a.id}
                                        href={a.city_id ? `/rides?destination=${a.city_id}` : '/rides'}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-amber-300/50"
                                    >
                                        <p className="text-xs tracking-widest text-amber-300 uppercase">{a.category}</p>
                                        <p className="mt-1 text-lg">{a.title}</p>
                                        <p className="mt-1 text-sm text-white/60">
                                            {[a.city, a.exam_date && fmtDate(a.exam_date)].filter(Boolean).join(' · ')}
                                            {a.city_id && ' · Find rides to this city →'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h2 className="mb-10 text-center font-serif text-4xl">How RideNovaPH works</h2>
                        <div className="grid gap-6 md:grid-cols-4">
                            {STEPS.map(({ icon: Icon, title, text }, n) => (
                                <div key={title} className="rounded-2xl border border-white/10 p-6">
                                    <Icon className="size-8 text-amber-300" />
                                    <p className="mt-4 text-xs text-white/40">STEP {n + 1}</p>
                                    <h3 className="mt-1 font-serif text-xl">{title}</h3>
                                    <p className="mt-2 text-sm text-white/65">{text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-200">
                                <Car className="size-5" /> Join RideNovaPH
                            </Link>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
                    © {new Date().getFullYear()} RideNovaPH · Cash on ride · Your ID is stored privately and viewed only by admins.
                </footer>
            </div>
        </>
    );
}
