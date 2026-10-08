import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import RideCard from '@/components/ride-card';
import type { RideCardData } from '@/components/ride-card';
import SiteHeader from '@/components/site-header';

type City = { id: number; name: string };
type Paginated = { data: RideCardData[]; prev_page_url: string | null; next_page_url: string | null };
type Props = {
    rides: Paginated;
    cities: City[];
    filters: { origin?: number; destination?: number; date?: string };
};

const field =
    'w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300 [color-scheme:dark]';

export default function RidesIndex({ rides, cities, filters }: Props) {
    const [q, setQ] = useState({
        origin: String(filters.origin ?? ''),
        destination: String(filters.destination ?? ''),
        date: filters.date ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/rides', Object.fromEntries(Object.entries(q).filter(([, v]) => v)));
    };

    return (
        <>
            <Head title="Find a ride" />
            <div className="relative min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
                <SiteHeader />
                <main className="mx-auto max-w-7xl px-5 pt-28 pb-20">
                    <h1 className="font-serif text-5xl">Find a ride</h1>
                    <p className="mt-2 text-white/60">Seats posted by verified drivers. Pay cash on the ride.</p>

                    <form onSubmit={submit} className="mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                        <select aria-label="From" value={q.origin} onChange={(e) => setQ({ ...q, origin: e.target.value })} className={field}>
                            <option value="">From: anywhere</option>
                            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select aria-label="To" value={q.destination} onChange={(e) => setQ({ ...q, destination: e.target.value })} className={field}>
                            <option value="">To: anywhere</option>
                            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input aria-label="Date" type="date" value={q.date} onChange={(e) => setQ({ ...q, date: e.target.value })} className={field} />
                        <button className="rounded-xl bg-amber-300 px-8 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200">Search</button>
                    </form>

                    {rides.data.length ? (
                        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {rides.data.map((r) => <RideCard key={r.id} ride={r} />)}
                        </div>
                    ) : (
                        <p className="mt-10 rounded-2xl border border-white/10 p-12 text-center text-white/60">
                            No rides match your search. Try another date or destination.
                        </p>
                    )}

                    <div className="mt-10 flex justify-between text-sm">
                        {rides.prev_page_url ? <Link href={rides.prev_page_url} className="text-amber-300 hover:underline">← Previous</Link> : <span />}
                        {rides.next_page_url && <Link href={rides.next_page_url} className="text-amber-300 hover:underline">Next →</Link>}
                    </div>
                </main>
            </div>
        </>
    );
}
