import { Head, Link } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';
import { Search, ArrowRight} from 'lucide-react';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
           <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[80vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <img
                        src="/background.jpg"
                        alt="Van in the mountains"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />

                    <div className="relative flex h-full flex-col">
                        <nav className="flex items-center justify-between px-6 py-6 md:px-10">
                            <div className="flex items-center gap-2 text-white">
                                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                                    <path d="M20 12L4 4l4 8-4 8 16-8z" fill="currentColor" />
                                </svg>
                              
                            </div>

                            <div className="hidden items-center rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm md:flex">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="w-32 bg-transparent text-sm text-white placeholder-white/70 outline-none"
                                />
                                <Search className="h-4 w-4 text-white" />
                            </div>
                        </nav>

                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                            <h1 className="max-w-3xl text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl md:text-5xl">
                                Set Your Travel Destination
                            </h1>
                            <div className="mt-6 h-px w-32 bg-white/60" />

                            <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 rounded-full bg-white/10 p-2 backdrop-blur-md sm:flex-row sm:items-center">
                                <div className="flex-1 rounded-full px-6 py-3 text-left">
                                    <p className="text-xs uppercase tracking-wide text-white/70">
                                        Location
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Where from?"
                                        className="w-full bg-transparent text-sm text-white placeholder-white/60 outline-none"
                                    />
                                </div>
                                <div className="hidden h-8 w-px bg-white/30 sm:block" />
                                <div className="flex-1 rounded-full px-6 py-3 text-left">
                                    <p className="text-xs uppercase tracking-wide text-white/70">
                                        Pick Up Date
                                    </p>
                                    <input
                                        type="date"
                                        className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                                    />
                                </div>
                                <div className="hidden h-8 w-px bg-white/30 sm:block" />
                                <div className="flex-1 rounded-full px-6 py-3 text-left">
                                    <p className="text-xs uppercase tracking-wide text-white/70">
                                        Return Date
                                    </p>
                                    <input
                                        type="date"
                                        className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            
                                  <Link
    href="/booking"
    className="mt-16 mb-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold tracking-wide text-neutral-900 uppercase"
>
    BOOK NOW!
    <ArrowRight className="h-4 w-4" />
</Link>
                           
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid gap-6 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900 md:grid-cols-3">
  
    <div className="flex flex-col items-center rounded-xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
         

        </div>
        <h3 className="text-lg font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
            First Time Renter
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            If this is your first time booking with us
        </p>
        <button className="mt-6 w-full rounded-md bg-neutral-800 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-700">
            How to Book a Ride
        </button>
    </div>

    
    <div className="flex flex-col items-center rounded-xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
           
           
        </div>
        <h3 className="text-lg font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
            New Vehicles
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            See the newest vans added to our fleet
        </p>
        <button className="mt-6 w-full rounded-md bg-neutral-800 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-700">
            Search Our Fleet
        </button>
    </div>


    <div className="flex flex-col items-center rounded-xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
           
            
        </div>
        <h3 className="text-lg font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
            Book a Ride
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Reserve a van for your next trip, hassle-free
        </p>
        <button className="mt-6 w-full rounded-md bg-neutral-800 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-700">
            Find a Ride
        </button>
    </div>
</div>

        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
