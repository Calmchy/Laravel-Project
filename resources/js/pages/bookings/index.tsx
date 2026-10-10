import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { fmtDateTime, peso, StatusBadge } from '@/components/lux';
import RideCard from '@/components/ride-card';
import type { RideCardData } from '@/components/ride-card';

type City = { id: number; name: string };
type Row = {
    id: number; reference_no: string; status: string; seats: number; total_fare: string;
    route: string; departure_at: string; passenger?: string;
};
type Paginated = { data: RideCardData[]; prev_page_url: string | null; next_page_url: string | null };
type Props = {
    tab: 'find' | 'mine';
    filters: { origin?: number; destination?: number; date?: string };
    cities: City[];
    rides: Paginated | null;
    mine: Row[];
    incoming: Row[];
};

const field = 'w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/20';

/** A list of bookings (used for both "trips I booked" and "requests on my rides"). */
function List({ title, rows, showPassenger, empty }: { title: string; rows: Row[]; showPassenger?: boolean; empty: string }) {
    return (
        <section>
            <h2 className="mb-4 font-serif text-2xl">{title}</h2>
            {rows.length ? (
                <div className="divide-y rounded-xl border bg-card">
                    {rows.map((b) => (
                        <Link key={b.id} href={`/bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-muted/60">
                            <div>
                                <p className="font-medium">{b.route}</p>
                                <p className="text-sm text-muted-foreground">
                                    {fmtDateTime(b.departure_at)} · {b.seats} seat{b.seats > 1 ? 's' : ''} · {peso(b.total_fare)}
                                    {showPassenger && b.passenger ? ` · ${b.passenger}` : ''}
                                </p>
                                <p className="font-mono text-xs text-teal-brand">{b.reference_no}</p>
                            </div>
                            <StatusBadge status={b.status} />
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">{empty}</p>
            )}
        </section>
    );
}

/**
 * ONE page for the two jobs people used to do on separate pages:
 *   "Find a ride" tab  -> search seats, open a ride, fill out the booking form
 *   "My bookings" tab  -> follow reservations, reference numbers and driver requests
 */
export default function BookingsIndex({ tab, filters, cities, rides, mine, incoming }: Props) {
    const [q, setQ] = useState({
        origin: String(filters.origin ?? ''),
        destination: String(filters.destination ?? ''),
        date: filters.date ?? '',
    });

    // Send only the filled-in fields; the server validates them again.
    const search = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/bookings', { tab: 'find', ...Object.fromEntries(Object.entries(q).filter(([, v]) => v)) });
    };

    const tabClass = (active: boolean) =>
        `rounded-full px-6 py-2.5 text-sm font-semibold transition ${active ? 'bg-teal-brand text-white shadow' : 'bg-muted text-muted-foreground hover:text-foreground'}`;

    return (
        <>
            <Head title="Bookings" />
            <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:p-8">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs tracking-[0.3em] text-coral uppercase">Rides &amp; reservations</p>
                        <h1 className="mt-1 font-serif text-4xl">Bookings</h1>
                    </div>
                    <nav className="flex gap-2" aria-label="Bookings sections">
                        <Link href="/bookings?tab=find" className={tabClass(tab === 'find')}>Find a ride</Link>
                        <Link href="/bookings?tab=mine" className={tabClass(tab === 'mine')}>My bookings</Link>
                    </nav>
                </header>

                {tab === 'find' && rides && (
                    <>
                        <form onSubmit={search} className="grid gap-3 rounded-3xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
                            <select aria-label="From" value={q.origin} onChange={(e) => setQ({ ...q, origin: e.target.value })} className={field}>
                                <option value="">From: anywhere</option>
                                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select aria-label="To" value={q.destination} onChange={(e) => setQ({ ...q, destination: e.target.value })} className={field}>
                                <option value="">To: anywhere</option>
                                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input aria-label="Date" type="date" value={q.date} onChange={(e) => setQ({ ...q, date: e.target.value })} className={field} />
                            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral px-8 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                                <Search className="size-4" /> Search
                            </button>
                        </form>

                        {rides.data.length ? (
                            // Dark cards keep their white-on-teal look inside the light page
                            <div className="grid gap-5 rounded-3xl bg-deep p-5 md:grid-cols-2 lg:grid-cols-3">
                                {rides.data.map((r) => <RideCard key={r.id} ride={r} />)}
                            </div>
                        ) : (
                            <p className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">No rides match your search. Try another date or destination.</p>
                        )}

                        <div className="flex justify-between text-sm">
                            {rides.prev_page_url ? <Link href={rides.prev_page_url} className="text-teal-brand hover:underline">← Previous</Link> : <span />}
                            {rides.next_page_url && <Link href={rides.next_page_url} className="text-teal-brand hover:underline">Next →</Link>}
                        </div>
                    </>
                )}

                {tab === 'mine' && (
                    <div className="flex flex-col gap-10">
                        <List title="Trips I booked" rows={mine} empty="You haven't booked a ride yet. Use the “Find a ride” tab to start." />
                        {incoming.length > 0 && <List title="Requests on rides I drive" rows={incoming} showPassenger empty="" />}
                    </div>
                )}
            </div>
        </>
    );
}
