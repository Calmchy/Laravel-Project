import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';

type BookingForm = {
    fullName: string;
    mobile: string;
    email: string;
    pickupLocation: string;
    destination: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    passengers: string;
    payment: string;
    notes: string;
};

const inputClass =
    'w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur transition focus:border-white/70 focus:bg-white/15 [color-scheme:dark]';

function Field({
    label,
    children,
    className = '',
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <label className={`flex flex-col gap-2 ${className}`}>
            <span className="text-xs font-medium tracking-wide text-white/70 uppercase">
                {label}
            </span>
            {children}
        </label>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md md:p-8">
            <h2 className="mb-5 text-lg font-semibold">{title}</h2>
            <div className="grid gap-5 md:grid-cols-2">{children}</div>
        </section>
    );
}

export default function Booking() {
    
    const { url } = usePage();
    const query = new URLSearchParams(url.split('?')[1] ?? '');

    const [form, setForm] = useState<BookingForm>({
        fullName: '',
        mobile: '',
        email: '',
        pickupLocation: query.get('location') ?? '',
        destination: '',
        pickupDate: query.get('pickup') ?? '',
        pickupTime: '',
        returnDate: query.get('return') ?? '',
        passengers: '1',
        payment: 'Cash',
        notes: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const set =
        (key: keyof BookingForm) =>
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        window.scrollTo({ top: 0 });
    };

    const summary: [string, string][] = [
        ['Full name', form.fullName],
        ['Mobile number', form.mobile],
        ['Email', form.email],
        ['Pick-up location', form.pickupLocation],
        ['Destination', form.destination],
        ['Pick-up date', form.pickupDate],
        ['Pick-up time', form.pickupTime],
        ['Return date', form.returnDate],
        ['Passengers', form.passengers],
        ['Payment method', form.payment],
        ['Notes', form.notes || '-'],
    ];

    return (
        <>
            <Head title="Book your ride" />

            <div className="relative isolate min-h-svh text-white">
                <div
                    aria-hidden
                    className="fixed -inset-8 -z-10 bg-cover bg-center blur-[10px]"
                    style={{
                        backgroundImage:
                            "linear-gradient(180deg, rgba(10,14,13,.6), rgba(10,14,13,.88)), url('/background.jpg')",
                    }}
                />

                <div className="mx-auto max-w-3xl px-5 py-8 md:py-12">
                    <Link
                        href="/dashboard"
                        className="mb-8 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
                    >
                        <ArrowLeft className="size-4" />
                        Back to dashboard
                    </Link>

                    <header className="mb-8">
                        <p className="text-sm font-semibold text-white/70">Ride Nova PH</p>
                        <h1 className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">
                            {submitted ? 'Booking received' : 'Complete your booking'}
                        </h1>
                        <p className="mt-3 max-w-xl text-white/75">
                            {submitted
                                ? `Thank you, ${form.fullName.split(' ')[0] || 'client'}! Here are the details you submitted.`
                                : 'Fill up the details below so we can confirm your ride.'}
                        </p>
                    </header>

                    {submitted ? (
                        <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md md:p-8">
                            <dl className="divide-y divide-white/15">
                                {summary.map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-6"
                                    >
                                        <dt className="text-sm text-white/65">{label}</dt>
                                        <dd className="text-sm font-medium sm:text-right">{value}</dd>
                                    </div>
                                ))}
                            </dl>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10"
                                >
                                    Edit details
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
                                >
                                    Back to dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <Section title="Your details">
                                <Field label="Full name" className="md:col-span-2">
                                    <input
                                        required
                                        value={form.fullName}
                                        onChange={set('fullName')}
                                        placeholder="Juan Dela Cruz"
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Mobile number">
                                    <input
                                        required
                                        type="tel"
                                        value={form.mobile}
                                        onChange={set('mobile')}
                                        placeholder="09XX XXX XXXX"
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Email address">
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={set('email')}
                                        placeholder="email@example.com"
                                        className={inputClass}
                                    />
                                </Field>
                            </Section>

                            <Section title="Trip details">
                                <Field label="Pick-up location">
                                    <input
                                        required
                                        value={form.pickupLocation}
                                        onChange={set('pickupLocation')}
                                        placeholder="Where from?"
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Destination">
                                    <input
                                        required
                                        value={form.destination}
                                        onChange={set('destination')}
                                        placeholder="Where to?"
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Pick-up date">
                                    <input
                                        required
                                        type="date"
                                        value={form.pickupDate}
                                        onChange={set('pickupDate')}
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Pick-up time">
                                    <input
                                        required
                                        type="time"
                                        value={form.pickupTime}
                                        onChange={set('pickupTime')}
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Return date">
                                    <input
                                        required
                                        type="date"
                                        min={form.pickupDate}
                                        value={form.returnDate}
                                        onChange={set('returnDate')}
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Number of passengers">
                                    <select
                                        value={form.passengers}
                                        onChange={set('passengers')}
                                        className={inputClass}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => (
                                            <option key={n} value={n} className="text-black">
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </Section>

                            <Section title="Payment and notes">
                                <Field label="Payment method" className="md:col-span-2">
                                    <select
                                        value={form.payment}
                                        onChange={set('payment')}
                                        className={inputClass}
                                    >
                                        {['Cash', 'GCash', 'Bank transfer'].map((p) => (
                                            <option key={p} value={p} className="text-black">
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Notes (optional)" className="md:col-span-2">
                                    <textarea
                                        rows={3}
                                        value={form.notes}
                                        onChange={set('notes')}
                                        placeholder="Special requests, landmarks, luggage, etc."
                                        className={inputClass}
                                    />
                                </Field>
                            </Section>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                                >
                                    CONFIRM BOOKING
                                    <ArrowRight className="size-4" />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}