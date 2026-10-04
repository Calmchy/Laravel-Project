import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarCheck,
    Car,
    LayoutDashboard,
    Search,
    Settings,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Status = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

type Booking = {
    ref: string;
    client: string;
    mobile: string;
    pickup: string;
    destination: string;
    pickupDate: string;
    returnDate: string;
    passengers: number;
    payment: string;
    status: Status;
};

// MOCK DATA lang ito para sa design. Papalitan ng totoong data galing sa database.
const bookings: Booking[] = [
    { ref: 'RN-1001', client: 'Maria Santos', mobile: '0917 123 4567', pickup: 'Davao City', destination: 'Samal Island', pickupDate: 'Oct 10, 2026', returnDate: 'Oct 12, 2026', passengers: 8, payment: 'GCash', status: 'Pending' },
    { ref: 'RN-1002', client: 'Juan Dela Cruz', mobile: '0928 555 0192', pickup: 'Tagum City', destination: 'Davao City', pickupDate: 'Oct 11, 2026', returnDate: 'Oct 11, 2026', passengers: 5, payment: 'Cash', status: 'Confirmed' },
    { ref: 'RN-1003', client: 'Ana Reyes', mobile: '0935 220 8841', pickup: 'Mabini', destination: 'Mati City', pickupDate: 'Oct 13, 2026', returnDate: 'Oct 14, 2026', passengers: 10, payment: 'Bank transfer', status: 'Confirmed' },
    { ref: 'RN-1004', client: 'Carlo Mendoza', mobile: '0906 778 3310', pickup: 'Davao City', destination: 'Digos City', pickupDate: 'Oct 02, 2026', returnDate: 'Oct 02, 2026', passengers: 4, payment: 'Cash', status: 'Completed' },
    { ref: 'RN-1005', client: 'Liza Gomez', mobile: '0999 410 7765', pickup: 'Panabo', destination: 'Davao Airport', pickupDate: 'Oct 15, 2026', returnDate: 'Oct 15, 2026', passengers: 3, payment: 'GCash', status: 'Pending' },
    { ref: 'RN-1006', client: 'Paolo Villanueva', mobile: '0917 904 1128', pickup: 'Davao City', destination: 'Cagayan de Oro', pickupDate: 'Oct 18, 2026', returnDate: 'Oct 20, 2026', passengers: 12, payment: 'Bank transfer', status: 'Cancelled' },
    { ref: 'RN-1007', client: 'Grace Tan', mobile: '0945 332 6709', pickup: 'Mati City', destination: 'Davao City', pickupDate: 'Sep 28, 2026', returnDate: 'Sep 29, 2026', passengers: 6, payment: 'Cash', status: 'Completed' },
    { ref: 'RN-1008', client: 'Miguel Torres', mobile: '0927 118 5543', pickup: 'Digos City', destination: 'Davao City', pickupDate: 'Oct 21, 2026', returnDate: 'Oct 22, 2026', passengers: 7, payment: 'GCash', status: 'Pending' },
];

const statusStyle: Record<Status, string> = {
    Pending: 'bg-amber-400/20 text-amber-200 ring-amber-300/40',
    Confirmed: 'bg-sky-400/20 text-sky-200 ring-sky-300/40',
    Completed: 'bg-emerald-400/20 text-emerald-200 ring-emerald-300/40',
    Cancelled: 'bg-rose-400/20 text-rose-200 ring-rose-300/40',
};

const filters: ('All' | Status)[] = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const nav = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Bookings', icon: CalendarCheck },
    { label: 'Vehicles', icon: Car },
    { label: 'Clients', icon: Users },
    { label: 'Settings', icon: Settings },
];

export default function Admin() {
    const [filter, setFilter] = useState<'All' | Status>('All');
    const [search, setSearch] = useState('');

    const counts = useMemo(
        () => ({
            total: bookings.length,
            Pending: bookings.filter((b) => b.status === 'Pending').length,
            Confirmed: bookings.filter((b) => b.status === 'Confirmed').length,
            Completed: bookings.filter((b) => b.status === 'Completed').length,
        }),
        [],
    );

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();

        return bookings.filter(
            (b) =>
                (filter === 'All' || b.status === filter) &&
                (!q ||
                    [b.ref, b.client, b.pickup, b.destination].some((v) =>
                        v.toLowerCase().includes(q),
                    )),
        );
    }, [filter, search]);

    const stats = [
        { label: 'Total bookings', value: counts.total },
        { label: 'Pending', value: counts.Pending },
        { label: 'Confirmed', value: counts.Confirmed },
        { label: 'Completed', value: counts.Completed },
    ];

    return (
        <>
            <Head title="Admin" />

            <div className="relative isolate min-h-svh text-white">
                <div
                    aria-hidden
                    className="fixed -inset-8 -z-10 bg-cover bg-center blur-[12px]"
                    style={{
                        backgroundImage:
                            "linear-gradient(180deg, rgba(10,14,13,.7), rgba(10,14,13,.9)), url('/background.jpg')",
                    }}
                />

                <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:flex-row md:p-6">
                    {/* Sidebar */}
                    <aside className="flex shrink-0 flex-col gap-6 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md md:sticky md:top-6 md:h-[calc(100svh-3rem)] md:w-60">
                        <div className="flex items-center gap-3">
                            <img src="/carpull1.png" alt="" className="size-10 object-contain" />
                            <div>
                                <p className="font-semibold leading-tight">Ride Nova PH</p>
                                <p className="text-xs text-white/60">Admin panel</p>
                            </div>
                        </div>

                        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
                            {nav.map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm whitespace-nowrap transition ${
                                        label === 'Bookings'
                                            ? 'bg-white text-black font-semibold'
                                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon className="size-4" />
                                    {label}
                                </button>
                            ))}
                        </nav>

                        <Link
                            href="/dashboard"
                            className="mt-auto inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
                        >
                            <ArrowLeft className="size-4" />
                            Back to site
                        </Link>
                    </aside>

                    {/* Main */}
                    <main className="flex min-w-0 flex-1 flex-col gap-6">
                        <header>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Bookings</h1>
                            <p className="mt-1 text-white/70">
                                Monitor everyone who booked a ride. Sample data lang muna ito.
                            </p>
                        </header>

                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {stats.map((s) => (
                                <div
                                    key={s.label}
                                    className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md"
                                >
                                    <p className="text-sm text-white/65">{s.label}</p>
                                    <p className="mt-2 text-4xl font-bold">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <section className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md md:p-6">
                            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {filters.map((f) => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => setFilter(f)}
                                            className={`rounded-full px-4 py-1.5 text-sm transition ${
                                                filter === f
                                                    ? 'bg-white font-semibold text-black'
                                                    : 'border border-white/25 text-white/80 hover:bg-white/10'
                                            }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>

                                <label className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 lg:w-72">
                                    <Search className="size-4 text-white/60" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, ref, place"
                                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
                                    />
                                </label>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[820px] text-left text-sm">
                                    <thead className="text-xs tracking-wide text-white/60 uppercase">
                                        <tr className="border-b border-white/15">
                                            {['Ref', 'Client', 'Trip', 'Dates', 'Pax', 'Payment', 'Status'].map((h) => (
                                                <th key={h} className="px-3 py-3 font-medium">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {rows.map((b) => (
                                            <tr key={b.ref} className="hover:bg-white/5">
                                                <td className="px-3 py-4 font-medium">{b.ref}</td>
                                                <td className="px-3 py-4">
                                                    <p className="font-medium">{b.client}</p>
                                                    <p className="text-xs text-white/60">{b.mobile}</p>
                                                </td>
                                                <td className="px-3 py-4">
                                                    {b.pickup}
                                                    <span className="mx-1.5 text-white/50">to</span>
                                                    {b.destination}
                                                </td>
                                                <td className="px-3 py-4 text-white/80">
                                                    {b.pickupDate}
                                                    {b.returnDate !== b.pickupDate && (
                                                        <span className="block text-xs text-white/55">
                                                            Return {b.returnDate}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">{b.passengers}</td>
                                                <td className="px-3 py-4 text-white/80">{b.payment}</td>
                                                <td className="px-3 py-4">
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusStyle[b.status]}`}
                                                    >
                                                        {b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {rows.length === 0 && (
                                    <p className="py-10 text-center text-white/60">
                                        Walang nahanap na booking.
                                    </p>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}