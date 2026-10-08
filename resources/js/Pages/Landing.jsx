import { Head, Link } from '@inertiajs/react';

export default function Landing() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between px-6 py-4 md:px-16 md:py-8">
            <Head title="Match-a-JOB-today?" />

            <img
                src="/images/main-bg.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover -z-10 -translate-y-10"
            />

            <header className="flex justify-between items-center w-full z-10">
                <img src="/images/matchd-logo-black.png" alt="Matchd" className="h-5 w-auto object-contain" />
            </header>

            <main className="w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-6">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                    <div className="w-full max-w-xl">
                        <img
                            src="/images/match-a-job-today.png"
                            alt="Match a job today?"
                            className="w-full h-auto max-w-xl sm:max-w-2xl"
                        />
                    </div>

                    <p className="text-slate-700 max-w-md text-sm">
                        Tag your skills, get scored against open roles, and let employers find you.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            href="/register"
                            className="bg-lime-600 hover:bg-lime-700 text-white font-semibold px-10 py-4 rounded-full shadow-md transition-all"
                        >
                            Sign Up
                        </Link>
                        <Link
                            href="/login"
                            className="bg-white/80 hover:bg-white text-slate-800 font-semibold px-10 py-4 rounded-full border border-slate-300 backdrop-blur-sm shadow-sm transition-all"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
