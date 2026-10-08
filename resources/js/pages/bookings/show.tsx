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
    };
    abilities: { approve: boolean; confirm: boolean; complete: boolean; cancel: boolean; review: boolean };
};

const LABEL = { approve: 'Approve request', confirm: 'Confirm my seat', complete: 'Mark trip completed' } as const;

export default function BookingShow({ booking, abilities }: Props) {
    const [copied, setCopied] = useState(false);
    const [reason, setReason] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const act = (action: string, data: object = {}) =>
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

                <header className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                    <p className="text-xs tracking-[0.3em] text-amber-300 uppercase">Reference number</p>
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

                {booking.status === 'cancelled' ? (
                    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm">
                        Cancelled{booking.cancelled_at && ` on ${fmtDateTime(booking.cancelled_at)}`}.
                        {booking.cancellation_reason && ` Reason: ${booking.cancellation_reason}`}
                    </p>
                ) : (
                    <ol className="space-y-3">
                        {timeline.map(([label, done, at]) => (
                            <li key={label} className="flex items-center gap-3">
                                <span className={`size-3 rounded-full ${done ? 'bg-amber-400' : 'bg-muted'}`} />
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
                                    className={`text-3xl transition ${n <= rating ? 'text-amber-400' : 'text-muted-foreground/30'}`}
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
