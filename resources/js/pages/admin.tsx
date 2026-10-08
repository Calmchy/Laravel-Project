import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { fmtDateTime, StatusBadge } from '@/components/lux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
    stats: { bookings: number; pending: number; confirmed: number; completed: number };
    bookings: { id: number; reference_no: string; passenger: string; phone: string | null; route: string; departure_at: string; seats: number; status: string }[];
    id_queue: { id: number; name: string; email: string; id_type: string; has_back: boolean; submitted_at: string }[];
    banners: { id: number; title: string; caption: string | null; link_url: string | null; is_active: boolean; image_url: string }[];
};

const TABS = ['Bookings', 'ID verification', 'Banners'] as const;
const FILTERS = ['all', 'pending', 'approved', 'confirmed', 'completed', 'cancelled'];

export default function Admin({ stats, bookings, id_queue, banners }: Props) {
    const [tab, setTab] = useState<(typeof TABS)[number]>('Bookings');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [remarks, setRemarks] = useState<Record<number, string>>({});

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();

        return bookings.filter(
            (b) =>
                (filter === 'all' || b.status === filter) &&
                (!q || [b.reference_no, b.passenger, b.route].some((v) => v.toLowerCase().includes(q))),
        );
    }, [bookings, filter, search]);

    const decide = (id: number, decision: 'approved' | 'rejected') =>
        router.patch(`/admin/identity-documents/${id}`, { decision, remarks: remarks[id] ?? '' }, { preserveScroll: true });

    const banner = useForm<{ title: string; caption: string; link_url: string; image: File | null }>({
        title: '', caption: '', link_url: '', image: null,
    });

    const input = 'w-full rounded-md border bg-background px-3 py-2 text-sm';

    return (
        <>
            <Head title="Admin" />
            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">
                <h1 className="font-serif text-4xl">Admin</h1>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {([['Total bookings', stats.bookings], ['Pending', stats.pending], ['Confirmed', stats.confirmed], ['Completed', stats.completed]] as const).map(([label, n]) => (
                        <Card key={label}>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle></CardHeader>
                            <CardContent className="text-4xl font-bold">{n}</CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex gap-2 border-b" role="tablist">
                    {TABS.map((t) => (
                        <button
                            key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                            className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${tab === t ? 'border-amber-500 font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            {t}{t === 'ID verification' && id_queue.length > 0 && <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs text-black">{id_queue.length}</span>}
                        </button>
                    ))}
                </div>

                {tab === 'Bookings' && (
                    <section className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                {FILTERS.map((f) => (
                                    <button key={f} onClick={() => setFilter(f)}
                                        className={`rounded-full px-4 py-1.5 text-sm capitalize ${filter === f ? 'bg-foreground text-background' : 'border hover:bg-muted'}`}>{f}</button>
                                ))}
                            </div>
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference, name, route" className={`${input} lg:w-72`} />
                        </div>
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
                                    <tr>{['Reference', 'Passenger', 'Route', 'Departure', 'Seats', 'Status'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y">
                                    {rows.map((b) => (
                                        <tr key={b.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono text-xs">{b.reference_no}</td>
                                            <td className="px-4 py-3">{b.passenger}<span className="block text-xs text-muted-foreground">{b.phone}</span></td>
                                            <td className="px-4 py-3">{b.route}</td>
                                            <td className="px-4 py-3">{fmtDateTime(b.departure_at)}</td>
                                            <td className="px-4 py-3">{b.seats}</td>
                                            <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {rows.length === 0 && <p className="p-10 text-center text-muted-foreground">No bookings found.</p>}
                        </div>
                    </section>
                )}

                {tab === 'ID verification' && (
                    <section className="space-y-4">
                        {id_queue.length === 0 && <p className="rounded-xl border p-10 text-center text-muted-foreground">Nothing waiting for review.</p>}
                        {id_queue.map((d) => (
                            <article key={d.id} className="grid gap-4 rounded-xl border p-4 md:grid-cols-[1fr_1fr_280px]">
                                <a href={`/admin/identity-documents/${d.id}/front`} target="_blank" rel="noreferrer">
                                    <img src={`/admin/identity-documents/${d.id}/front`} alt={`Front of ${d.name}'s ID`} className="h-48 w-full rounded-lg border object-contain" />
                                </a>
                                {d.has_back ? (
                                    <a href={`/admin/identity-documents/${d.id}/back`} target="_blank" rel="noreferrer">
                                        <img src={`/admin/identity-documents/${d.id}/back`} alt={`Back of ${d.name}'s ID`} className="h-48 w-full rounded-lg border object-contain" />
                                    </a>
                                ) : <div className="flex h-48 items-center justify-center rounded-lg border text-sm text-muted-foreground">No back image</div>}
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-medium">{d.name}</p>
                                        <p className="text-sm text-muted-foreground">{d.email}</p>
                                        <p className="text-sm">{d.id_type} · {fmtDateTime(d.submitted_at)}</p>
                                    </div>
                                    <input value={remarks[d.id] ?? ''} maxLength={255} onChange={(e) => setRemarks({ ...remarks, [d.id]: e.target.value })} placeholder="Remark (shown if rejected)" className={input} />
                                    <div className="flex gap-2">
                                        <Button onClick={() => decide(d.id, 'approved')}>Approve</Button>
                                        <Button variant="destructive" onClick={() => decide(d.id, 'rejected')}>Reject</Button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {tab === 'Banners' && (
                    <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-3">
                            {banners.length === 0 && <p className="rounded-xl border p-10 text-center text-muted-foreground">No banners yet. The homepage shows default destination slides until you add some.</p>}
                            {banners.map((b) => (
                                <div key={b.id} className="flex items-center gap-4 rounded-xl border p-3">
                                    <img src={b.image_url} alt="" className="h-16 w-28 rounded-md object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{b.title}</p>
                                        <p className="truncate text-xs text-muted-foreground">{b.caption}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => router.patch(`/admin/banners/${b.id}`, {}, { preserveScroll: true })}>{b.is_active ? 'Hide' : 'Show'}</Button>
                                    <Button variant="destructive" size="sm" onClick={() => confirm('Delete this banner?') && router.delete(`/admin/banners/${b.id}`, { preserveScroll: true })}>Delete</Button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); banner.post('/admin/banners', { forceFormData: true, onSuccess: () => banner.reset() }); }} className="h-fit space-y-3 rounded-xl border p-5">
                            <h2 className="font-serif text-xl">Add a slide</h2>
                            <input required placeholder="Title (e.g. Palawan)" value={banner.data.title} onChange={(e) => banner.setData('title', e.target.value)} className={input} />
                            <InputError message={banner.errors.title} />
                            <input placeholder="Caption" value={banner.data.caption} onChange={(e) => banner.setData('caption', e.target.value)} className={input} />
                            <input placeholder="Link, e.g. /rides?destination=3" value={banner.data.link_url} onChange={(e) => banner.setData('link_url', e.target.value)} className={input} />
                            <InputError message={banner.errors.link_url} />
                            <input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => banner.setData('image', e.target.files?.[0] ?? null)} className={input} />
                            <InputError message={banner.errors.image} />
                            <Button type="submit" disabled={banner.processing} className="w-full">Add banner</Button>
                        </form>
                    </section>
                )}
            </div>
        </>
    );
}
