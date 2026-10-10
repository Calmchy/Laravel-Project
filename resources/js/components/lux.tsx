// Small shared helpers so every page formats dates and booking statuses the same way.
import { cn } from '@/lib/utils';

export const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

export const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-PH', { dateStyle: 'medium' });

export const peso = (amount: string | number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));

const STATUS_STYLE: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-300',
    approved: 'bg-sky-500/15 text-sky-600 ring-sky-500/30 dark:text-sky-300',
    confirmed: 'bg-indigo-500/15 text-indigo-600 ring-indigo-500/30 dark:text-indigo-300',
    completed: 'bg-emerald-500/15 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300',
    cancelled: 'bg-rose-500/15 text-rose-600 ring-rose-500/30 dark:text-rose-300',
    rejected: 'bg-rose-500/15 text-rose-600 ring-rose-500/30 dark:text-rose-300',
};

export function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={cn(
                'inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ring-1',
                STATUS_STYLE[status] ?? 'bg-muted text-muted-foreground ring-border',
            )}
        >
            {status}
        </span>
    );
}

export function Stars({ value }: { value: number }) {
    return (
        <span aria-label={`${value} out of 5 stars`} className="text-amber-400">
            {'★'.repeat(value)}
            <span className="text-muted-foreground/40">{'★'.repeat(5 - value)}</span>
        </span>
    );
}
