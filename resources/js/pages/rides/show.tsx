import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { fmtDateTime, peso } from '@/components/lux';
import SiteHeader from '@/components/site-header';

type Props = {
    ride: {
        id: number; origin: string; destination: string; pickup_point: string;
        dropoff_point: string | null; departure_at: string; price_per_seat: string;
        seats_left: number; vehicle: string; driver_name: string; notes: string | null; status: string;
    };
    driver_rating: { average: number | null; total: number };
    my_booking_id: number | null;
    can_book: boolean;
    has_approved_id: boolean;
};

export default function RideShow({ ride, driver_rating, my_booking_id, can_book, has_approved_id }: Props) {
    const { auth, errors } = usePage().props;
    const [seats, setSeats] = useState(1);
    const [busy, setBusy] = useState(false);

    const reserve = () =>
        router.post(`/rides/${ride.id}/book`, { seats }, { onStart: () => setBusy(true), onFinish: () => setBusy(false) });

    const cta = 'block w-full rounded-xl px-6 py-3.5 text-center font-semibold transition';

    return (
        <>
            <Head title={`${ride.origin} to ${ride.destination}`} />
            <div className="relative min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
                <SiteHeader />
                <main className="mx-auto max-w-5xl px-5 pt-28 pb-20">
                    <Link href="/rides" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
                        <ArrowLeft className="size-4" /> All rides
                    </Link>

                    <div className="grid gap-8 md:grid-cols-[1fr_340px]">
                        <section className="space-y-6">
                            <h1 className="font-serif text-5xl">
                                {ride.origin} <span className="text-amber-300">→</span> {ride.destination}
                            </h1>
                            <dl className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2">
                                {[
                                    ['Departure', fmtDateTime(ride.departure_at)],
                                    ['Pick-up point', ride.pickup_point],
                                    ['Drop-off point', ride.dropoff_point ?? 'To be agreed with the driver'],
                                    ['Vehicle', ride.vehicle],
                                    ['Driver', ride.driver_name],
                                    ['Driver rating', driver_rating.average ? `★ ${driver_rating.average} (${driver_rating.total} reviews)` : 'No reviews yet'],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <dt className="text-xs tracking-widest text-amber-300 uppercase">{k}</dt>
                                        <dd className="mt-1 text-white/90">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                            {ride.notes && <p className="rounded-2xl border border-white/10 p-5 text-white/70">{ride.notes}</p>}
                        </section>

                        <aside className="h-fit space-y-4 rounded-3xl border border-amber-300/25 bg-slate-900/70 p-6 backdrop-blur">
                            <p className="font-serif text-4xl text-amber-200">{peso(ride.price_per_seat)}<span className="text-base text-white/50"> / seat</span></p>
                            <p className="text-sm text-white/60">{ride.seats_left} seats left · cash on the ride</p>

                            {my_booking_id ? (
                                <Link href={`/bookings/${my_booking_id}`} className={`${cta} bg-white/10 hover:bg-white/20`}>View my booking</Link>
                            ) : ride.status !== 'open' || ride.seats_left < 1 ? (
                                <p className={`${cta} cursor-not-allowed bg-white/5 text-white/40`}>Fully booked</p>
                            ) : !auth.user ? (
                                <Link href="/login" className={`${cta} bg-amber-300 text-slate-950 hover:bg-amber-200`}>Log in to reserve</Link>
                            ) : !has_approved_id ? (
                                <Link href="/identity" className={`${cta} bg-amber-300 text-slate-950 hover:bg-amber-200`}>Verify your ID to book</Link>
                            ) : can_book ? (
                                <>
                                    <label className="block text-sm text-white/70">
                                        Seats
                                        <select
                                            value={seats}
                                            onChange={(e) => setSeats(Number(e.target.value))}
                                            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                                        >
                                            {Array.from({ length: Math.min(ride.seats_left, 6) }, (_, n) => n + 1).map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <button onClick={reserve} disabled={busy} className={`${cta} bg-amber-300 text-slate-950 hover:bg-amber-200 disabled:opacity-60`}>
                                        {busy ? 'Reserving…' : `Reserve · ${peso(Number(ride.price_per_seat) * seats)}`}
                                    </button>
                                </>
                            ) : (
                                <p className="text-sm text-white/60">This is your own ride.</p>
                            )}

                            {Object.values(errors ?? {}).map((m) => (
                                <p key={m} className="text-sm text-rose-300">{m}</p>
                            ))}
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}
