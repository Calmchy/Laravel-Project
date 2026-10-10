import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, CalendarCheck, Car, Search, Star } from 'lucide-react';
import BannerSlideshow from '@/components/banner-slideshow';
import type { Banner } from '@/components/banner-slideshow';
import { fmtDate } from '@/components/lux';
import RideCard from '@/components/ride-card';
import type { RideCardData } from '@/components/ride-card';
import SiteHeader from '@/components/site-header';

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
    rides: RideCardData[];
    announcements: Announcement[];
};

const STEPS = [
    { icon: BadgeCheck, title: 'Verify your ID', text: 'Upload a valid ID once. An admin checks it so everyone on board is accountable.' },
    { icon: Search, title: 'Pick a ride', text: 'Browse open rides by origin, destination and date, then reserve the seats you need.' },
    { icon: CalendarCheck, title: 'Driver approves', text: 'The driver accepts your request and you confirm. You get a reference number.' },
    { icon: Star, title: 'Ride and review', text: 'Pay cash on the ride, then rate each other to keep the community trusted.' },
];

export default function Welcome({ banners, rides, announcements }: Props) {
    return (
        <>
            <Head title="Affordable shared rides across the Philippines" />
            <div className="min-h-screen bg-deep text-white">
                <SiteHeader />
                <BannerSlideshow banners={banners} />

                <main className="mx-auto max-w-7xl space-y-24 px-5 py-20">
                    <section>
                        <div className="mb-8 flex items-end justify-between">
                            <h2 className="font-serif text-4xl">Upcoming rides</h2>
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
                                        href={a.city_id ? `/bookings?tab=find&destination=${a.city_id}` : '/bookings?tab=find'}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-sand/50"
                                    >
                                        <p className="text-xs tracking-widest text-sand uppercase">{a.category}</p>
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
                                    <Icon className="size-8 text-sand" />
                                    <p className="mt-4 text-xs text-white/40">STEP {n + 1}</p>
                                    <h3 className="mt-1 font-serif text-xl">{title}</h3>
                                    <p className="mt-2 text-sm text-white/65">{text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-sand px-8 py-3 font-semibold text-deep transition hover:bg-peach">
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
