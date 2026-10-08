import { Link } from '@inertiajs/react';
import { CalendarClock, MapPin, Users } from 'lucide-react';
import { fmtDateTime, peso } from '@/components/lux';

export type RideCardData = {
    id: number;
    origin: string;
    destination: string;
    pickup_point: string;
    departure_at: string;
    price_per_seat: string;
    seats_left: number;
    vehicle: string;
    driver_name: string;
};

/** Whole card is one big link, so the entire surface is clickable. */
export default function RideCard({ ride }: { ride: RideCardData }) {
    return (
        <Link
            href={`/rides/${ride.id}`}
            className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/10"
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-xl text-white">
                    {ride.origin} <span className="text-amber-300">→</span> {ride.destination}
                </h3>
                <span className="shrink-0 rounded-full bg-amber-300/15 px-3 py-1 text-sm font-semibold text-amber-200">
                    {peso(ride.price_per_seat)}
                </span>
            </div>
            <ul className="space-y-1.5 text-sm text-white/70">
                <li className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-amber-300" />
                    {fmtDateTime(ride.departure_at)}
                </li>
                <li className="flex items-center gap-2">
                    <MapPin className="size-4 text-amber-300" />
                    {ride.pickup_point}
                </li>
                <li className="flex items-center gap-2">
                    <Users className="size-4 text-amber-300" />
                    {ride.seats_left} {ride.seats_left === 1 ? 'seat' : 'seats'} left · {ride.driver_name}
                </li>
            </ul>
            <span className="mt-auto text-sm text-amber-300 transition group-hover:translate-x-1">View ride →</span>
        </Link>
    );
}
