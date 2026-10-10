import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, Car, Check, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import LocationPicker from '@/components/location-picker';
import { fmtDateTime, peso } from '@/components/lux';
import RouteMap from '@/components/route-map';

type Props = {
    ride: {
        id: number; origin: string; destination: string; pickup_point: string; dropoff_point: string | null;
        departure_at: string; price_per_seat: string; seats_left: number; vehicle: string; driver_name: string; notes: string | null;
    };
    map: { origin: { lat: number; lng: number } | null };
    prefill: { name: string; email: string; phone: string };
};

type StepId = 'ride' | 'details' | 'trip' | 'review';
const STEPS: { id: StepId; title: string }[] = [
    { id: 'ride', title: 'Ride' },
    { id: 'details', title: 'Your Details' },
    { id: 'trip', title: 'Pick-Up & Return' },
    { id: 'review', title: 'Review & Reserve' },
];
const HEADINGS: Record<StepId, string> = { ride: 'Ride', details: 'Your Details', trip: 'Pick-Up & Return', review: 'Review & Reserve' };

const input = 'w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/20';
const label = 'mb-1 block text-xs font-semibold tracking-wide text-muted-foreground uppercase';

/** ISO date from the server -> the "YYYY-MM-DDTHH:mm" string a datetime-local input expects (in the user's own timezone). */
const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');

    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** White summary card with an icon, a title and an optional action (the Edit button). */
function Card({ icon: Icon, title, action, children }: { icon: typeof Car; title: string; action?: ReactNode; children: ReactNode }) {
    return (
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-sand/40 text-coral"><Icon className="size-5" /></span>
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

const outlineBtn = 'rounded-lg border border-foreground/70 px-4 py-1.5 text-xs font-semibold transition hover:bg-muted';

/** Label + value pair used inside the review cards. */
const Fact = ({ k, children }: { k: string; children: ReactNode }) => (
    <div className="min-w-0">
        <dt className="text-sm font-semibold">{k}</dt>
        <dd className="mt-1 space-y-0.5 text-sm break-words text-muted-foreground">{children}</dd>
    </div>
);

/**
 * Booking page: a 4-step flow styled as a "Review & Reserve" checkout.
 *   Ride (already chosen) -> Your Details -> Pick-Up & Return (map + GPS) -> Review & Reserve.
 * Every step is validated here for fast feedback AND again on the server (StoreBookingRequest).
 */
export default function BookingCreate({ ride, map, prefill }: Props) {
    const form = useForm({
        seats: 1,
        contact_name: prefill.name,
        contact_address: '',
        contact_email: prefill.email,
        contact_phone: prefill.phone,
        pickup_location: '',
        pickup_lat: null as number | null,
        pickup_lng: null as number | null,
        pickup_at: toLocalInput(ride.departure_at),
        return_location: '',
        return_lat: null as number | null,
        return_lng: null as number | null,
        return_at: '',
    });
    type Data = typeof form.data;
    const d = form.data;

    const [step, setStep] = useState<StepId>('details');
    const [reached, setReached] = useState(1); // highest step index the user has unlocked
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const idx = STEPS.findIndex((s) => s.id === step);

    // Price is derived, never typed: rate x seats. (The server recomputes it from the ride, so it can't be tampered with.)
    const rate = Number(ride.price_per_seat);
    const total = rate * d.seats;

    const err = (k: string) => localErrors[k] ?? (form.errors as Record<string, string | undefined>)[k];

    /** Update a text field and clear its error as soon as the user starts fixing it. */
    const set = (k: keyof Data) => (e: { target: { value: string } }) => {
        form.setData(k, e.target.value as never);
        setLocalErrors((p) => {
            const n = { ...p };
            delete n[k];

            return n;
        });
    };

    /** Check one step's fields. Returns {field: message}; an empty object means the step is valid. */
    const validate = (s: StepId): Record<string, string> => {
        const e: Record<string, string> = {};

        if (s === 'details') {
            if (!d.contact_name.trim()) {
e.contact_name = 'Enter your full name.';
}

            if (!/^\S+@\S+\.\S+$/.test(d.contact_email)) {
e.contact_email = 'Enter a valid email address.';
}

            if (!d.contact_address.trim()) {
e.contact_address = 'Enter your address.';
}

            if (!/^(\+63|0)9\d{9}$/.test(d.contact_phone)) {
e.contact_phone = 'Enter a Philippine mobile number like 09123456789.';
}
        }

        if (s === 'trip') {
            if (!d.pickup_location.trim()) {
e.pickup_location = 'Choose a pick-up point on the map, or type one.';
}

            if (!d.pickup_at) {
e.pickup_at = 'Choose the pick-up date and time.';
}

            if (!d.return_location.trim()) {
e.return_location = 'Choose a return point on the map, or type one.';
}

            if (!d.return_at) {
e.return_at = 'Choose the return date and time.';
} else if (d.pickup_at && d.return_at < d.pickup_at) {
e.return_at = 'The return must be after the pick-up.';
}
        }

        return e;
    };

    /** Which step shows a given field? Used to jump to the right step when the server reports an error. */
    const stepFor = (key: string): StepId =>
        key.startsWith('contact_') || key === 'seats' ? 'details' : key.startsWith('pickup_') || key.startsWith('return_') ? 'trip' : 'review';

    const show = (target: StepId) => {
        setStep(target);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /** "Continue": validate this step, unlock and open the next one. */
    const next = () => {
        const e = validate(step);
        setLocalErrors(e);

        if (Object.keys(e).length) {
            return;
        }

        const n = idx + 1;
        setReached((r) => Math.max(r, n));
        show(STEPS[n].id);
    };

    /** Sidebar / Edit buttons: only steps already unlocked can be opened. */
    const goTo = (target: StepId) => {
        if (STEPS.findIndex((s) => s.id === target) <= reached) {
            show(target);
        }
    };

    /** Map -> form: the picker reports a point; copy it into the matching form fields. */
    const onPick = (which: 'pickup' | 'return', p: { label: string; lat: number | null; lng: number | null }) => {
        form.setData((prev) => ({ ...prev, [`${which}_location`]: p.label, [`${which}_lat`]: p.lat, [`${which}_lng`]: p.lng }));
        setLocalErrors((e) => {
            const n = { ...e };
            delete n[`${which}_location`];

            return n;
        });
    };

    /** Final submit: re-check both steps, then POST. Server errors send the user back to the right step. */
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const all = { ...validate('details'), ...validate('trip') };

        if (Object.keys(all).length) {
            setLocalErrors(all);
            show(stepFor(Object.keys(all)[0]));

            return;
        }

        form.post(`/rides/${ride.id}/book`, {
            preserveScroll: true,
            onError: (errors) => show(stepFor(Object.keys(errors)[0] ?? '')),
        });
    };

    // Short line shown under each step title in the sidebar
    const sub: Record<StepId, string> = {
        ride: `${ride.origin} → ${ride.destination}`,
        details: d.contact_name || 'Not filled in yet',
        trip: d.pickup_location ? d.pickup_location.split(',')[0] : 'Not set yet',
        review: `${d.seats} seat${d.seats > 1 ? 's' : ''} · ${peso(total)}`,
    };

    const primary = 'rounded-xl bg-teal-brand px-8 py-3 text-sm font-semibold text-white transition hover:brightness-110';
    const ghost = 'rounded-xl border px-6 py-3 text-sm font-semibold transition hover:bg-muted';

    return (
        <>
            <Head title="Book this ride" />
            <div className="mx-auto max-w-7xl p-3 md:p-6">
                <div className="grid gap-3 rounded-[2rem] bg-deep p-3 shadow-2xl lg:grid-cols-[300px_1fr]">
                    {/* ---------- Stepper sidebar ---------- */}
                    <aside className="flex flex-col p-4 text-white lg:p-6">
                        <Link href="/" className="mb-8 flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center rounded-full bg-sand text-deep"><Car className="size-5" /></span>
                            <span className="font-serif text-2xl">RideNova<span className="text-sand">PH</span></span>
                        </Link>

                        <ol className="relative space-y-7">
                            <span aria-hidden className="absolute top-4 bottom-4 left-4 w-px bg-white/15" />
                            {STEPS.map((s, n) => {
                                const done = n < idx || s.id === 'ride';
                                const active = n === idx;
                                const circle = `relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                    active ? 'border border-sand bg-deep text-sand' : done ? 'border border-white/20 bg-deep-2 text-white/80' : 'bg-deep-2 text-white/40'
                                }`;
                                const body = (
                                    <>
                                        <span className={circle}>{done && !active ? <Check className="size-4" /> : n + 1}</span>
                                        <span className="min-w-0 text-left">
                                            <span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-white/85'}`}>{s.title}</span>
                                            <span className="block truncate text-xs text-white/55">{sub[s.id]}</span>
                                        </span>
                                    </>
                                );

                                return (
                                    <li key={s.id}>
                                        {s.id === 'ride' ? (
                                            // Step 1 is the ride page itself: clicking it goes back to review the ride
                                            <Link href={`/rides/${ride.id}`} className="flex gap-4">{body}</Link>
                                        ) : (
                                            <button type="button" onClick={() => goTo(s.id)} disabled={n > reached} className="flex w-full gap-4 disabled:cursor-not-allowed">{body}</button>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>

                        <div className="mt-8 rounded-xl border border-sand/60 bg-deep-2/70 p-4 lg:mt-auto">
                            <p className="text-[11px] font-semibold tracking-widest text-sand uppercase">Estimated total</p>
                            <p className="mt-1 font-serif text-3xl">{peso(total)} *</p>
                            <p className="mt-1 text-xs text-white/60">*Cash on the ride. No booking fees.</p>
                        </div>
                    </aside>

                    {/* ---------- Main panel ---------- */}
                    <form onSubmit={submit} className="space-y-5 rounded-2xl bg-muted/50 p-5 md:p-8">
                        <h1 className="font-serif text-3xl">{HEADINGS[step]}</h1>

                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-deep p-6 text-white">
                            <div>
                                <p className="text-lg font-semibold">Booking as {prefill.name}</p>
                                <p className="mt-1 text-sm text-white/65">Your account details are prefilled. Update them anytime in your profile.</p>
                            </div>
                            <a href="/settings/profile" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-sand px-5 py-2 text-sm font-semibold text-deep transition hover:bg-peach">Profile</a>
                        </div>

                        {/* ===== Step 2: Your details ===== */}
                        {step === 'details' && (
                            <>
                                <Card icon={UserRound} title="About you">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={label} htmlFor="contact_name">Full name</label>
                                            <input id="contact_name" value={d.contact_name} onChange={set('contact_name')} maxLength={100} className={input} autoComplete="name" />
                                            <InputError message={err('contact_name')} />
                                        </div>
                                        <div>
                                            <label className={label} htmlFor="contact_email">Email</label>
                                            <input id="contact_email" type="email" value={d.contact_email} onChange={set('contact_email')} className={input} autoComplete="email" />
                                            <InputError message={err('contact_email')} />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className={label} htmlFor="contact_address">Home address</label>
                                            <input id="contact_address" value={d.contact_address} onChange={set('contact_address')} maxLength={200} placeholder="Street, barangay, city" className={input} autoComplete="street-address" />
                                            <InputError message={err('contact_address')} />
                                        </div>
                                        <div>
                                            <label className={label} htmlFor="contact_phone">Contact number</label>
                                            <input id="contact_phone" type="tel" value={d.contact_phone} onChange={set('contact_phone')} placeholder="09123456789" className={input} autoComplete="tel" />
                                            <InputError message={err('contact_phone')} />
                                        </div>
                                        <div>
                                            <label className={label} htmlFor="seats">Seats</label>
                                            <select id="seats" value={d.seats} onChange={(e) => form.setData('seats', Number(e.target.value))} className={input}>
                                                {Array.from({ length: Math.min(ride.seats_left, 6) }, (_, n) => n + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                            <InputError message={err('seats')} />
                                        </div>
                                    </div>
                                </Card>
                                <div className="flex justify-end"><button type="button" onClick={next} className={primary}>Continue →</button></div>
                            </>
                        )}

                        {/* ===== Step 3: Pick-up & return (map + live GPS) ===== */}
                        {step === 'trip' && (
                            <>
                                <Card icon={CalendarDays} title="Where and when">
                                    <LocationPicker
                                        center={map.origin}
                                        pickup={{ label: d.pickup_location, lat: d.pickup_lat, lng: d.pickup_lng }}
                                        ret={{ label: d.return_location, lat: d.return_lat, lng: d.return_lng }}
                                        onChange={onPick}
                                    />
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={label} htmlFor="pickup_location">Pick-up location</label>
                                            <input id="pickup_location" value={d.pickup_location} onChange={set('pickup_location')} maxLength={200} className={input} />
                                            <InputError message={err('pickup_location')} />
                                        </div>
                                        <div>
                                            <label className={label} htmlFor="pickup_at">Pick-up date &amp; time</label>
                                            <input id="pickup_at" type="datetime-local" value={d.pickup_at} onChange={set('pickup_at')} className={input} />
                                            <InputError message={err('pickup_at')} />
                                        </div>
                                        <div>
                                            <label className={label} htmlFor="return_location">Return location</label>
                                            <input id="return_location" value={d.return_location} onChange={set('return_location')} maxLength={200} className={input} />
                                            <InputError message={err('return_location')} />
                                        </div>
                                        <div>
                                            <label className={label} htmlFor="return_at">Return date &amp; time</label>
                                            <input id="return_at" type="datetime-local" min={d.pickup_at} value={d.return_at} onChange={set('return_at')} className={input} />
                                            <InputError message={err('return_at')} />
                                        </div>
                                    </div>
                                </Card>
                                <div className="flex justify-between">
                                    <button type="button" onClick={() => goTo('details')} className={ghost}>← Back</button>
                                    <button type="button" onClick={next} className={primary}>Continue →</button>
                                </div>
                            </>
                        )}

                        {/* ===== Step 4: Review & reserve ===== */}
                        {step === 'review' && (
                            <>
                                <Card icon={CalendarDays} title="Trip Details" action={<button type="button" onClick={() => goTo('trip')} className={outlineBtn}>Edit</button>}>
                                    <dl className="grid gap-6 sm:grid-cols-3 sm:divide-x">
                                        <Fact k="Dates & Times">
                                            <p>{d.pickup_at && fmtDateTime(d.pickup_at)}</p>
                                            <p>{d.return_at && fmtDateTime(d.return_at)}</p>
                                        </Fact>
                                        <div className="sm:pl-6">
                                            <Fact k="Pick-up & Return Location">
                                                <p><span className="font-medium text-foreground">Pick-up:</span> {d.pickup_location}</p>
                                                <p><span className="font-medium text-foreground">Return:</span> {d.return_location}</p>
                                            </Fact>
                                        </div>
                                        <div className="sm:pl-6">
                                            <Fact k="Additional Details">
                                                <p>Seats: {d.seats}</p>
                                                <p>Contact: {d.contact_phone}</p>
                                            </Fact>
                                        </div>
                                    </dl>
                                </Card>

                                <Card icon={UserRound} title="Your Details" action={<button type="button" onClick={() => goTo('details')} className={outlineBtn}>Edit</button>}>
                                    <dl className="grid gap-6 sm:grid-cols-2">
                                        <Fact k="Name"><p>{d.contact_name}</p></Fact>
                                        <Fact k="Email"><p>{d.contact_email}</p></Fact>
                                        <Fact k="Address"><p>{d.contact_address}</p></Fact>
                                        <Fact k="Contact number"><p>{d.contact_phone}</p></Fact>
                                    </dl>
                                </Card>

                                <Card icon={Car} title="Ride" action={<Link href="/bookings?tab=find" className={outlineBtn}>Change Ride</Link>}>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-xl bg-muted p-5">
                                            <p className="text-sm font-semibold">{ride.origin} → {ride.destination}</p>
                                            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                                                <li>{ride.vehicle}</li>
                                                <li>Driver: {ride.driver_name}</li>
                                                <li>Departs {fmtDateTime(ride.departure_at)}</li>
                                            </ul>
                                            <RouteMap pickup={{ lat: d.pickup_lat, lng: d.pickup_lng }} ret={{ lat: d.return_lat, lng: d.return_lng }} className="mt-4 h-48 w-full" />
                                        </div>
                                        <div className="rounded-xl bg-muted p-5 text-sm">
                                            <p className="font-semibold">Ride Cost</p>
                                            <div className="mt-2 flex justify-between text-muted-foreground"><span>{d.seats} seat{d.seats > 1 ? 's' : ''} – {peso(rate)}/seat</span><span>{peso(total)}</span></div>
                                            <div className="flex justify-between text-muted-foreground"><span>Payment: cash on the ride</span><span>Included</span></div>
                                            <hr className="my-4" />
                                            <p className="font-semibold">Fees</p>
                                            <div className="mt-2 flex justify-between text-muted-foreground"><span>Booking fee</span><span>{peso(0)}</span></div>
                                            <hr className="my-4" />
                                            <div className="flex items-end justify-between"><span className="font-semibold">Estimated Total</span><span className="font-serif text-3xl">{peso(total)}</span></div>
                                        </div>
                                    </div>
                                </Card>

                                <InputError message={err('ride') ?? err('id')} />
                                <div className="flex justify-between">
                                    <button type="button" onClick={() => goTo('trip')} className={ghost}>← Back</button>
                                    <button disabled={form.processing} className="rounded-xl bg-coral px-8 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                                        {form.processing ? 'Reserving…' : 'Submit booking request'}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}
