import { Head, Link } from '@inertiajs/react';
import { BrandMark } from '../Components/Brand';

export default function AuthLayout({ title, heading, subtitle, footer, children }) {
    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-800">
            <Head title={title} />

            <div className="hidden lg:flex lg:w-5/12 bg-slate-900 flex-col justify-between p-12 text-white relative overflow-hidden">
                <Link href="/" className="z-10">
                    <BrandMark tone="light" className="w-36" />
                </Link>

                <div className="z-10 my-auto max-w-md">
                    <span className="px-3 py-1 bg-brand/20 text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                        Skill-based matching
                    </span>
                    <h1 className="text-4xl font-bold mt-4 leading-tight">Match a job today.</h1>
                    <p className="text-slate-400 mt-4 text-sm leading-relaxed">
                        Applicants and employers tag their skills. Matchd scores the overlap so the right people find each other faster.
                    </p>
                </div>

                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand/20 rounded-full blur-3xl" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-success/20 rounded-full blur-3xl" />
                <p className="z-10 text-xs text-slate-500">&copy; {new Date().getFullYear()} Matchd. All rights reserved.</p>
            </div>

            <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
                    <Link href="/" className="lg:hidden block">
                        <BrandMark className="w-28" />
                    </Link>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{heading}</h2>
                        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
                    </div>

                    {children}

                    {footer && <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">{footer}</div>}
                </div>
            </div>
        </div>
    );
}
