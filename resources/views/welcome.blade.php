<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome Client - Pull-A-Part</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">

    <style>
        :root {
            --ink: #f6f3ec;
            --ink-soft: #d9d5cb;
            --night: #0d1714;
            --amber: #f0a83a;
            --steel: #8fa3a0;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body { min-height: 100%; }

        body {
            font-family: 'Barlow', system-ui, sans-serif;
            color: var(--ink);
            background-color: var(--night);
            position: relative;
            isolation: isolate;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }


        body::before {
            content: '';
            position: fixed;
            inset: -30px;
            z-index: -1;
            background-image:
                linear-gradient(90deg, rgba(13,23,20,.85) 0%, rgba(13,23,20,.62) 45%, rgba(13,23,20,.3) 100%),
                var(--bg-photo);
            background-size: cover;
            background-position: center;
            filter: blur(10px);
        }

        a:focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; }

       
        .topbar {
            display: flex;
            justify-content: flex-end;
            gap: .75rem;
            padding: 2rem 3rem 0;
        }
        .topbar a {
            color: var(--ink);
            text-decoration: none;
            font-size: .875rem;
            font-weight: 500;
            padding: .5rem 1.1rem;
            border: 1px solid transparent;
            border-radius: 4px;
            transition: border-color .15s, background .15s;
        }
        .topbar a:hover { border-color: rgba(246,243,236,.55); background: rgba(246,243,236,.08); }
        .topbar a.outlined { border-color: rgba(246,243,236,.55); }

       
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
            border-left: 4px solid var(--amber);
            padding-left: 1.5rem;
            max-width: 40rem;
        }
        .quote h2 {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 600;
            font-size: clamp(1.4rem, 2.4vw, 1.9rem);
            line-height: 1.15;
            margin-bottom: 1rem;
        }
        .quote p {
            color: var(--ink-soft);
            font-size: 1.02rem;
            line-height: 1.7;
            margin-bottom: 1.5rem;
        }
        .quote .cta {
            display: inline-block;
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700;
            font-size: 1.25rem;
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

       
        @media (max-width: 900px) {
            .topbar { padding: 1.25rem 1.25rem 0; }
            main { grid-template-columns: 1fr; gap: 2.5rem; padding: 2rem 1.25rem 3rem; }
            .art { justify-self: center; max-width: 340px; }
        }
    </style>
</head>
<body style="--bg-photo: url('{{ asset('background.jpg') }}');">

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
            <img src="{{ asset('carpull1.png') }}" alt="Pull-A-Part">
        </figure>
    </main>

</body>
</html>
