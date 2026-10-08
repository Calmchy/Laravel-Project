import { Head, Link } from '@inertiajs/react';
import { fmtDateTime, peso, StatusBadge } from '@/components/lux';

type Row = {
    id: number; reference_no: string; status: string; seats: number; total_fare: string;
    route: string; departure_at: string; passenger?: string;
};

function List({ title, empty, rows, showPassenger }: { title: string; empty: string; rows: Row[]; showPassenger?: boolean }) {
    return (
        <section>
            <h2 className="mb-4 font-serif text-2xl">{title}</h2>
            {rows.length ? (
                <div className="divide-y rounded-xl border">
                    {rows.map((b) => (
                        <Link key={b.id} href={`/bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-muted/50">
                            <div>
                                <p className="font-medium">{b.route}</p>
                                <p className="text-sm text-muted-foreground">
                                    {fmtDateTime(b.departure_at)} · {b.seats} seat{b.seats > 1 ? 's' : ''} · {peso(b.total_fare)}
                                    {showPassenger && b.passenger ? ` · ${b.passenger}` : ''}
                                </p>
                                <p className="font-mono text-xs text-amber-600">{b.reference_no}</p>
                            </div>
                            <StatusBadge status={b.status} />
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="rounded-xl border p-8 text-center text-muted-foreground">{empty}</p>
            )}
        </section>
    );
}

export default function BookingsIndex({ mine, incoming }: { mine: Row[]; incoming: Row[] }) {
    return (
        <>
            <Head title="My bookings" />
            <div className="mx-auto flex max-w-4xl flex-col gap-10 p-4 md:p-8">
                <h1 className="font-serif text-4xl">My bookings</h1>
                <List title="Trips I booked" rows={mine} empty="You haven't booked a ride yet." />
                {incoming.length > 0 && <List title="Requests on rides I drive" rows={incoming} showPassenger empty="" />}
            </div>
        </>
    );
}
