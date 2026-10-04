import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
            <div className="relative isolate flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div
            aria-hidden
            className="fixed -inset-8 -z-10 bg-cover bg-center blur-[10px]"
            style={{
                backgroundImage:
                    "linear-gradient(90deg, rgba(13,23,20,.85), rgba(13,23,20,.55)), url('/background.jpg')",
            }}
        />
        <div className="w-full max-w-sm rounded-xl border border-white/15 bg-background/50 p-8 backdrop-blur-md">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-24 w-24 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-24" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
