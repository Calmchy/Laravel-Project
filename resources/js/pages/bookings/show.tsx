import { Head, Link, router } from '@inertiajs/react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { fmtDateTime, peso, Stars, StatusBadge } from '@/components/lux';
import { Button } from '@/components/ui/button';

type Props = {
    booking: {
        id: number; reference_no: string; status: string; seats: number; total_fare: string;
        route: string; passenger: string; driver: string; pickup_point: string; departure_at: string;
        approved_at: string | null; confirmed_at: string | null; completed_at: string | null; cancelled_at: string | null;
        cancellation_reason: string | null;
        reviews: { by: string; rating: number; comment: string | null }[];
        details: {
            name: string | null; address: string | null; email: string | null; phone: string | null;
            pickup_location: string | null; pickup_lat: number | null; pickup_lng: number | null; pickup_at: string | null;
            return_location: string | null; return_lat: number | null; return_lng: number | null; return_at: string | null;
            rate: number;
        };
    };
    abilities: { approve: boolean; confirm: boolean; complete: boolean; cancel: boolean; review: boolean };
};

const LABEL = { approve: 'Approve request', confirm: 'Confirm my seat', complete: 'Mark trip completed' } as const;

/** Link that opens a saved map point in OpenStreetMap (new tab, no referrer or opener leaked). */
const mapLink = (lat: number | null, lng: number | null) =>
    lat !== null && lng !== null ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}` : null;

export default function BookingShow({ booking, abilities }: Props) {
    const [copied, setCopied] = useState(false);
    const [reason, setReason] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const act = (action: string, data: Record<string, string | number> = {}) =>
        router.patch(`/bookings/${booking.id}/${action}`, data, { preserveScroll: true });

    const copy = async () => {
        await navigator.clipboard.writeText(booking.reference_no);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const timeline = [
        ['Reserved', true, null],
        ['Approved by driver', booking.approved_at, booking.approved_at],
        ['Confirmed', booking.confirmed_at, booking.confirmed_at],
        ['Completed', booking.completed_at, booking.completed_at],
    ] as const;

    return (
        <>
            <Head title={`Booking ${booking.reference_no}`} />
            <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4 md:p-8">
                <Link href="/bookings" className="text-sm text-muted-foreground hover:text-foreground">← All bookings</Link>

                <header className="rounded-2xl border border-sand/40 bg-gradient-to-br from-deep-2 to-deep-2 p-6 text-white">
                    <p className="text-xs tracking-[0.3em] text-sand uppercase">Reference number</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <p className="font-mono text-3xl tracking-wider">{booking.reference_no}</p>
                        <button onClick={copy} aria-label="Copy reference number" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
                            {copied ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />}
                        </button>
                        <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-3 text-sm text-white/60">Show this code to your driver. It is your proof of booking.</p>
                </header>

                <dl className="grid gap-4 rounded-xl border p-6 sm:grid-cols-2">
                    {[
                        ['Route', booking.route], ['Departure', fmtDateTime(booking.departure_at)],
                        ['Pick-up point', booking.pickup_point], ['Seats', String(booking.seats)],
                        ['Total (cash on ride)', peso(booking.total_fare)], ['Passenger', booking.passenger],
                        ['Driver', booking.driver],
                    ].map(([k, v]) => (
                        <div key={k}>
                            <dt className="text-xs tracking-widest text-muted-foreground uppercase">{k}</dt>
                            <dd className="mt-1">{v}</dd>
                        </div>
                    ))}
                </dl>

                {booking.details.name && (
                    <section className="rounded-xl border bg-card p-6">
                        <h2 className="font-serif text-2xl">Trip details</h2>
                        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                            {[
                                ['Name', booking.details.name], ['Contact number', booking.details.phone],
                                ['Email', booking.details.email], ['Address', booking.details.address],
                                ['Rate per seat', peso(booking.details.rate)],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <dt className="text-xs tracking-widest text-muted-foreground uppercase">{k}</dt>
                                    <dd className="mt-1 break-words">{v}</dd>
                                </div>
                            ))}
                            {([
                                ['Pick-up', booking.details.pickup_location, booking.details.pickup_at, mapLink(booking.details.pickup_lat, booking.details.pickup_lng)],
                                ['Return', booking.details.return_location, booking.details.return_at, mapLink(booking.details.return_lat, booking.details.return_lng)],
                            ] as const).map(([k, place, when, link]) => (
                                <div key={k} className="rounded-lg bg-muted/60 p-4 sm:col-span-1">
                                    <dt className="text-xs tracking-widest text-muted-foreground uppercase">{k}</dt>
                                    <dd className="mt-1 break-words">{place}</dd>
                                    {when && <dd className="text-sm text-muted-foreground">{fmtDateTime(when)}</dd>}
                                    {link && <a href={link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-medium text-teal-brand hover:underline">View on map ↗</a>}
                                </div>
                            ))}
                        </dl>
                    </section>
                )}

                {booking.status === 'cancelled' ? (
                    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm">
                        Cancelled{booking.cancelled_at && ` on ${fmtDateTime(booking.cancelled_at)}`}.
                        {booking.cancellation_reason && ` Reason: ${booking.cancellation_reason}`}
                    </p>
                ) : (
                    <ol className="space-y-3">
                        {timeline.map(([label, done, at]) => (
                            <li key={label} className="flex items-center gap-3">
                                <span className={`size-3 rounded-full ${done ? 'bg-sand' : 'bg-muted'}`} />
                                <span className={done ? '' : 'text-muted-foreground'}>{label}</span>
                                {at && <span className="text-xs text-muted-foreground">{fmtDateTime(at)}</span>}
                            </li>
                        ))}
                    </ol>
                )}

                <div className="flex flex-wrap items-end gap-3">
                    {(['approve', 'confirm', 'complete'] as const).map(
                        (a) => abilities[a] && <Button key={a} onClick={() => act(a)}>{LABEL[a]}</Button>,
                    )}
                    {abilities.cancel && (
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                maxLength={255}
                                placeholder="Reason (optional)"
                                className="rounded-md border bg-background px-3 py-2 text-sm"
                            />
                            <Button variant="destructive" onClick={() => confirm('Cancel this booking?') && act('cancel', { reason })}>
                                Cancel booking
                            </Button>
                        </div>
                    )}
                </div>

                {booking.reviews.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="font-serif text-2xl">Reviews</h2>
                        {booking.reviews.map((r) => (
                            <div key={r.by} className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">From the {r.by}</p>
                                <Stars value={r.rating} />
                                {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                            </div>
                        ))}
                    </section>
                )}

                {abilities.review && (
                    <section className="space-y-3 rounded-xl border p-6">
                        <h2 className="font-serif text-2xl">How was the trip?</h2>
                        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} stars`}
                                    onClick={() => setRating(n)}
                                    className={`text-3xl transition ${n <= rating ? 'text-sand' : 'text-muted-foreground/30'}`}
                                >★</button>
                            ))}
                        </div>
                        <textarea
                            value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={3}
                            placeholder="Optional comment"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                        <Button onClick={() => router.post(`/bookings/${booking.id}/reviews`, { rating, comment }, { preserveScroll: true })}>
                            Submit review
                        </Button>
                    </section>
                )}
            </div>
        </>
    );
}
