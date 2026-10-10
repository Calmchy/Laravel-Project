import { Head, Link } from '@inertiajs/react';
import { CalendarCheck, CheckCircle2, Clock, Ticket } from 'lucide-react';
import DashboardSlideshow from '@/components/dashboard-slideshow';
import type { Slide } from '@/components/dashboard-slideshow';
import { fmtDateTime, StatusBadge } from '@/components/lux';

type Props = {
    slides: Slide[];
    stats: { active: number; completed: number; total: number };
    awaiting_my_approval: number;
    upcoming: { id: number; reference_no: string; status: string; route: string; departure_at: string }[];
};

/** Small number tile; the whole tile is a link to the bookings hub. */
function Stat({ icon: Icon, label, value, tone }: { icon: typeof Ticket; label: string; value: number; tone: string }) {
    return (
        <Link href="/bookings?tab=mine" className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className={`flex size-11 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
            <p className="mt-4 font-serif text-4xl">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </Link>
    );
}

/**
 * Dashboard = announcements slideshow on top, your numbers, what needs attention,
 * and your next trips. ID verification lives on the profile pages only.
 */
export default function Dashboard({ slides, stats, awaiting_my_approval, upcoming }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:p-8">
                <DashboardSlideshow slides={slides} />

                <header>
                    <p className="text-xs tracking-[0.3em] text-coral uppercase">Welcome back</p>
                    <h1 className="mt-1 font-serif text-4xl">Where to next?</h1>
                </header>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Stat icon={Clock} label="Active bookings" value={stats.active} tone="bg-seafoam text-deep" />
                    <Stat icon={CheckCircle2} label="Trips completed" value={stats.completed} tone="bg-peach text-deep" />
                    <Stat icon={Ticket} label="All bookings" value={stats.total} tone="bg-teal-brand/15 text-teal-brand" />
                </div>

                {awaiting_my_approval > 0 && (
                    <Link href="/bookings?tab=mine" className="flex items-center gap-4 rounded-2xl border border-coral/40 bg-coral/10 p-5 transition hover:bg-coral/15">
                        <CalendarCheck className="size-7 text-coral" />
                        <div>
                            <p className="font-medium">{awaiting_my_approval} passenger request{awaiting_my_approval > 1 ? 's' : ''} waiting for your approval</p>
                            <p className="text-sm text-muted-foreground">Open Bookings to approve or decline →</p>
                        </div>
                    </Link>
                )}

                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <h2 className="font-serif text-2xl">Your upcoming trips</h2>
                        <Link href="/bookings?tab=find" className="text-sm font-medium text-teal-brand hover:underline">Find a ride →</Link>
                    </div>
                    {upcoming.length ? (
                        <div className="divide-y rounded-xl border bg-card">
                            {upcoming.map((b) => (
                                <Link key={b.id} href={`/bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-muted/60">
                                    <div>
                                        <p className="font-medium">{b.route}</p>
                                        <p className="text-sm text-muted-foreground">{fmtDateTime(b.departure_at)} · <span className="font-mono text-teal-brand">{b.reference_no}</span></p>
                                    </div>
                                    <StatusBadge status={b.status} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
                            No upcoming trips. <Link href="/bookings?tab=find" className="font-medium text-teal-brand underline">Find a ride</Link>
                        </p>
                    )}
                </section>
            </div>
        </>
    );
}
