import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, CalendarCheck, Search } from 'lucide-react';
import { fmtDateTime, StatusBadge } from '@/components/lux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
    id_status: 'pending' | 'approved' | 'rejected' | null;
    awaiting_my_approval: number;
    upcoming: { id: number; reference_no: string; status: string; route: string; departure_at: string }[];
};

const ID_COPY = {
    none: { title: 'Verify your ID', text: 'Upload a valid ID to start booking rides.', cta: 'Upload ID' },
    pending: { title: 'ID under review', text: 'An admin is checking your ID. This usually takes a short while.', cta: 'View status' },
    approved: { title: 'ID verified', text: 'You can reserve seats on any ride.', cta: 'View status' },
    rejected: { title: 'ID needs a new upload', text: 'Your last upload was not accepted. Please try again.', cta: 'Upload again' },
} as const;

export default function Dashboard({ id_status, awaiting_my_approval, upcoming }: Props) {
    const idCopy = ID_COPY[id_status ?? 'none'];
    const tile = 'transition hover:-translate-y-0.5 hover:shadow-lg';

    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:p-8">
                <header>
                    <p className="text-xs tracking-[0.3em] text-amber-500 uppercase">Welcome back</p>
                    <h1 className="mt-1 font-serif text-4xl">Where to next?</h1>
                </header>

                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/identity" className="block">
                        <Card className={tile}>
                            <CardHeader>
                                <BadgeCheck className={`size-7 ${id_status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                <CardTitle>{idCopy.title}</CardTitle>
                                <CardDescription>{idCopy.text}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm font-medium text-amber-600">{idCopy.cta} →</CardContent>
                        </Card>
                    </Link>

                    <Link href="/rides" className="block">
                        <Card className={tile}>
                            <CardHeader>
                                <Search className="size-7 text-amber-500" />
                                <CardTitle>Find a ride</CardTitle>
                                <CardDescription>Search seats by origin, destination and date.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm font-medium text-amber-600">Search rides →</CardContent>
                        </Card>
                    </Link>

                    <Link href="/bookings" className="block">
                        <Card className={tile}>
                            <CardHeader>
                                <CalendarCheck className="size-7 text-amber-500" />
                                <CardTitle>My bookings</CardTitle>
                                <CardDescription>
                                    {awaiting_my_approval > 0
                                        ? `${awaiting_my_approval} passenger request${awaiting_my_approval > 1 ? 's' : ''} waiting for your approval.`
                                        : 'Track reservations, reference numbers and reviews.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm font-medium text-amber-600">Open bookings →</CardContent>
                        </Card>
                    </Link>
                </div>

                <section>
                    <h2 className="mb-4 font-serif text-2xl">Your upcoming trips</h2>
                    {upcoming.length ? (
                        <div className="divide-y rounded-xl border">
                            {upcoming.map((b) => (
                                <Link key={b.id} href={`/bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-muted/50">
                                    <div>
                                        <p className="font-medium">{b.route}</p>
                                        <p className="text-sm text-muted-foreground">{fmtDateTime(b.departure_at)} · {b.reference_no}</p>
                                    </div>
                                    <StatusBadge status={b.status} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-xl border p-8 text-center text-muted-foreground">
                            No upcoming trips. <Link href="/rides" className="text-amber-600 underline">Find a ride</Link>
                        </p>
                    )}
                </section>
            </div>
        </>
    );
}
