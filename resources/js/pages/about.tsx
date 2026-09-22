import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { about } from '@/routes';

export default function About() {
    return (
        <>
            <Head title="About" />
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut velit cum, enim est at quia error, in architecto provident facilis dicta ducimus aspernatur iusto a necessitatibus, sequi sed eligendi. Quidem.</p>
        </>
    );
}

About.layout = {
    breadcrumbs: [
        {
            title: 'About',
            href: about(),
        },
    ],
};
