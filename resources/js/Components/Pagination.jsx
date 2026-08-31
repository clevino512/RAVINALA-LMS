import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    const previousLink = links[0];
    const nextLink = links[links.length - 1];
    const pageLinks = links.slice(1, -1);

    const arrowClass =
        'flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700';
    const disabledArrowClass =
        'flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-300';

    return (
        <div className="flex items-center justify-end gap-2">
            {previousLink?.url ? (
                <Link href={previousLink.url} className={arrowClass} preserveScroll>
                    <ChevronLeftIcon className="h-5 w-5" />
                </Link>
            ) : (
                <span className={disabledArrowClass}>
                    <ChevronLeftIcon className="h-5 w-5" />
                </span>
            )}

            {pageLinks.map((link, index) => {
                const label = String(link.label).replace(/&amp;/g, '&');

                if (!link.url) {
                    return (
                        <span
                            key={index}
                            className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-300"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                            link.active
                                ? 'bg-gradient-to-r from-[#2d8b46] to-[#24763a] text-white shadow-[0_10px_20px_rgba(45,139,70,0.22)]'
                                : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}

            {nextLink?.url ? (
                <Link href={nextLink.url} className={arrowClass} preserveScroll>
                    <ChevronRightIcon className="h-5 w-5" />
                </Link>
            ) : (
                <span className={disabledArrowClass}>
                    <ChevronRightIcon className="h-5 w-5" />
                </span>
            )}
        </div>
    );
}
