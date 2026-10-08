import { Link, usePage } from '@inertiajs/react';

/**
 * Header for the PUBLIC pages (landing + ride search). It works for guests too:
 * the signed-in app header assumes a user exists, so these pages don't use it.
 */
export default function SiteHeader() {
    const { auth } = usePage().props;
    const link = 'rounded-full px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white';

    return (
        <header className="absolute inset-x-0 top-0 z-30">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
                <Link href="/" className="font-serif text-2xl tracking-wide text-white">
                    RideNova<span className="text-amber-300">PH</span>
                </Link>
                <nav className="flex items-center gap-1">
                    <Link href="/rides" className={link}>
                        Find a ride
                    </Link>
                    {auth.user ? (
                        <Link
                            href="/dashboard"
                            className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className={link}>
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
