import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';
import { Search, ArrowRight} from 'lucide-react';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
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
