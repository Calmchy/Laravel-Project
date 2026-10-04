<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome Client - Pull-A-Part</title>
    <link rel="icon" href="{{ asset('carpull1.png') }}" type="image/png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">

    <script>document.documentElement.classList.add('js');</script>

    <style>
        :root {
            --ink: #f6f3ec;
            --ink-soft: #ece8de;
            --night: #0d1714;
            --amber: #f0a83a;
            --steel: #8fa3a0;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }
        html, body { min-height: 100%; }

        body {
            font-family: 'Barlow', system-ui, sans-serif;
            color: var(--ink);
            background-color: var(--night);
            position: relative;
            isolation: isolate;
            font-size: 1.125rem;
            line-height: 1.6;
        }

        /* Blurred na background (ang picture ay galing sa --bg-photo sa <body>) */
        body::before {
            content: '';
            position: fixed;
            inset: -30px;
            z-index: -1;
            background-image:
                linear-gradient(rgba(13,23,20,.8), rgba(13,23,20,.8)),
                var(--bg-photo);
            background-size: cover;
            background-position: center;
            filter: blur(10px);
        }

        a:focus-visible { outline: 3px solid var(--amber); outline-offset: 3px; }

        /* ================= HERO (unang screen) ================= */
        .hero {
            min-height: 100vh;
            min-height: 100svh;
            display: flex;
            flex-direction: column;
        }

        .topbar {
            display: flex;
            justify-content: flex-end;
            gap: .75rem;
            padding: 2rem 3rem 0;
        }
        .topbar a {
            color: #fff;
            text-decoration: none;
            font-size: 1.05rem;
            font-weight: 600;
            padding: .65rem 1.4rem;
            background: rgba(13,23,20,.85);
            border: 2px solid rgba(246,243,236,.7);
            border-radius: 6px;
            transition: background .15s, border-color .15s;
        }
        .topbar a:hover { background: rgba(35,52,47,.95); border-color: var(--amber); }

        main {
            flex: 1;
            width: 100%;
            max-width: 1240px;
            margin: 0 auto;
            padding: 3rem;
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
            gap: 4rem;
            align-items: center;
        }

        h1 {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700;
            font-size: clamp(3.5rem, 9vw, 7.5rem);
            line-height: .92;
            letter-spacing: -.01em;
            margin-bottom: 2.25rem;
        }
        h1 span { display: block; color: var(--amber); }

        .quote {
            border-left: 5px solid var(--amber);
            background: rgba(13,23,20,.85);
            padding: 1.75rem 1.75rem 1.75rem 1.75rem;
            border-radius: 0 12px 12px 0;
            max-width: 42rem;
        }
        .quote h2 {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 600;
            font-size: clamp(1.4rem, 2.4vw, 1.9rem);
            line-height: 1.15;
            margin-bottom: 1rem;
        }
        .quote p {
            color: #f6f3ec;
            font-size: 1.15rem;
            line-height: 1.8;
            margin-bottom: 1.5rem;
        }
        .quote .cta {
            display: inline-block;
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700;
            font-size: 1.4rem;
            color: var(--night);
            background: var(--amber);
            padding: .7rem 1.4rem;
            border-radius: 4px;
        }

        .art {
            aspect-ratio: 1 / 1;
            width: 100%;
            max-width: 460px;
            justify-self: end;
            border: 1px solid rgba(246,243,236,.25);
            border-radius: 10px;
            background: rgba(13,23,20,.55);
            backdrop-filter: blur(4px);
            display: flex;
            overflow: hidden;
        }
        .art img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 1.5rem;
            display: block;
        }

        .scroll-hint {
            align-self: center;
            margin-bottom: 1.75rem;
            color: var(--ink);
            text-decoration: none;
            font-size: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: .35rem;
        }
        .scroll-hint svg { width: 22px; height: 22px; animation: bob 1.6s ease-in-out infinite; }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }

        /* ================= MGA SECTION SA IBABA ================= */
        .band { background: rgba(13,23,20,.72); }

        .section {
            max-width: 1240px;
            margin: 0 auto;
            padding: 5rem 3rem;
        }
        .section-title {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700;
            font-size: clamp(2.2rem, 4.5vw, 3.4rem);
            color: var(--amber);
            text-align: center;
            margin-bottom: 3rem;
        }

        .cards-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
        .cards-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }

        .card {
            background: rgba(13,23,20,.9);
            border: 1px solid rgba(246,243,236,.3);
            border-radius: 12px;
            padding: 1.75rem;
        }
        .card {
            transition: transform .25s ease, background .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .card.accent { border-bottom: 4px solid var(--amber); }

        /* Hover: tumataas ang card, umiilaw ang gilid, at gumagalaw ang icon */
        .card:hover,
        .js .reveal.in.card:hover {
            transform: translateY(-6px);
            background: rgba(26,41,36,.97);
            border-color: rgba(240,168,58,.75);
            box-shadow: 0 18px 40px rgba(0,0,0,.35);
        }
        .card.accent:hover { border-bottom-color: var(--amber); }
        .card .icon { transition: transform .25s ease; }
        .card:hover .icon { transform: scale(1.18) rotate(-6deg); }

        /* How it works: clickable */
        a.card { display: block; color: inherit; text-decoration: none; cursor: pointer; }
        a.card .more {
            margin-top: 1.1rem;
            display: inline-flex;
            align-items: center;
            gap: .45rem;
            color: var(--amber);
            font-weight: 600;
            font-size: 1.05rem;
        }
        a.card .more svg { width: 16px; height: 16px; transition: transform .2s ease; }
        a.card:hover .more svg { transform: translateX(5px); }
        .card .icon {
            width: 32px;
            height: 32px;
            color: var(--amber);
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            margin-bottom: 1rem;
        }
        .card h3 {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700;
            font-size: 1.8rem;
            margin-bottom: .5rem;
        }
        .card p { color: #f6f3ec; line-height: 1.7; font-size: 1.1rem; }

        .features {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
            gap: 3rem;
            align-items: center;
        }
        .illus { width: 100%; max-width: 480px; height: auto; object-fit: contain; justify-self: center; display: block; }

        /* Lalabas nang paunti-unti habang nag-i-scroll */
        .js .reveal { opacity: 0; transform: translateY(28px); transition: opacity .6s ease, transform .6s ease; }
        .js .reveal.in { opacity: 1; transform: none; }
        .js .reveal.done {
            transition: transform .25s ease, background .25s ease, border-color .25s ease, box-shadow .25s ease;
            transition-delay: 0s;
        }
        .reveal:nth-child(2) { transition-delay: .1s; }
        .reveal:nth-child(3) { transition-delay: .2s; }
        .reveal:nth-child(4) { transition-delay: .3s; }

        @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            .js .reveal { opacity: 1; transform: none; transition: none; }
            .scroll-hint svg { animation: none; }
            .card:hover, .js .reveal.in.card:hover, .card:hover .icon { transform: none; }
        }

        /* Mobile */
        @media (max-width: 900px) {
            .topbar { padding: 1.25rem 1.25rem 0; }
            main { grid-template-columns: 1fr; gap: 2.5rem; padding: 2rem 1.25rem 3rem; }
            .art { justify-self: center; max-width: 340px; }
            .section { padding: 3.5rem 1.25rem; }
            .cards-3, .features { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
            .cards-2 { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body style="--bg-photo: url('{{ asset('background.jpg') }}');">

    <div class="hero">
        {{-- Login / Register --}}
        @if (Route::has('login'))
            <nav class="topbar">
                @auth
                    <a href="{{ url('/dashboard') }}">Dashboard</a>
                @else
                    <a href="{{ route('login') }}">Log in</a>

                    @if (Route::has('register'))
                        <a href="{{ route('register') }}" class="outlined">Register</a>
                    @endif
                @endauth
            </nav>
        @endif

        <main>
            <section>
                <h1>Welcome,<span>Client</span></h1>

                <div class="quote">
                    <h2>BUY USED AUTO PARTS &amp; USED CARS FOR SALE — SELL YOUR JUNK CAR TOO!</h2>
                    <p>
                        Pull-A-Part is a superior alternative to digging through a junkyard. Start by searching our
                        state-of-the-art online car inventory database, refreshed daily. Visit or call one of our clean
                        and organized nationwide junkyards near you where removing your car parts is easy, saving you
                        expensive labor costs, mark-ups and time! If you need cash now and have a salvage junk car to
                        sell, contact your nearest Pull-A-Part location to get a free purchase quote, free tow, and fast cash.
                    </p>
                    <span class="cta">FIND WHAT YOU NEED AT PULL-A-PART</span>
                </div>
            </section>

            <figure class="art">
                <img src="{{ asset('carpull.png') }}" alt="Pull-A-Part">
            </figure>
        </main>

        <a href="#how" class="scroll-hint" aria-label="Scroll down">
            Scroll down
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </a>
    </div>

    {{-- ============ SECTION 1: How it works ============ --}}
    <div class="band" id="how">
        <div class="section">
            <h2 class="section-title reveal">How it works</h2>

            <div class="cards-3">
                <a href="{{ Route::has('register') ? route('register') : url('/') }}" class="card accent reveal">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                    <h3>Drivers</h3>
                    <p>List your trip with where you are headed and when you leave, so riders can find you right away.</p>
                    <span class="more">Sign up to drive <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
                </a>

                <a href="{{ url('/booking') }}" class="card accent reveal">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <h3>Passengers</h3>
                    <p>Browse trips that match your route, then reserve a seat in a few taps and fill up your details.</p>
                    <span class="more">Book a ride <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
                </a>

                <a href="#features" class="card accent reveal">
                    <svg class="icon" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>
                    <h3>Share the Journey</h3>
                    <p>Split the cost, meet people headed the same way, and make every trip lighter on the road.</p>
                    <span class="more">See the features <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
                </a>
            </div>
        </div>
    </div>

    {{-- ============ SECTION 2: Key Features ============ --}}
    <div class="section" id="features">
        <h2 class="section-title reveal">Key Features</h2>

        <div class="features">
            <img src="{{ asset('carpull1.png') }}" alt="Pull-A-Part" class="illus reveal">

            <div class="cards-2">
                <div class="card reveal">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
                    <h3>Save Money</h3>
                    <p>Split fuel and toll costs so every trip costs a lot less.</p>
                </div>

                <div class="card reveal">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                    <h3>Eco-Friendly</h3>
                    <p>Fewer vehicles on the road means a smaller carbon footprint.</p>
                </div>

                <div class="card reveal">
                    <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <h3>Convenience</h3>
                    <p>Find or offer rides that fit your schedule and your route.</p>
                </div>

                <div class="card reveal">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <h3>Community</h3>
                    <p>Travel with people going the same way and enjoy the ride.</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        (function () {
            var els = document.querySelectorAll('.reveal');

            if (!('IntersectionObserver' in window)) {
                els.forEach(function (el) { el.classList.add('in', 'done'); });
                return;
            }

            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        setTimeout(function () { entry.target.classList.add('done'); }, 1000);
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            els.forEach(function (el) { io.observe(el); });
        })();
    </script>
</body>
</html>