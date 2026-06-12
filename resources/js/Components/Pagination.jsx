import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-between border-t border-dark-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                {links[0]?.url ? (
                    <Link
                        href={links[0].url}
                        className="btn-secondary text-sm"
                    >
                        Précédent
                    </Link>
                ) : (
                    <span className="btn-secondary cursor-not-allowed text-sm opacity-50">
                        Précédent
                    </span>
                )}
                {links[links.length - 1]?.url ? (
                    <Link
                        href={links[links.length - 1].url}
                        className="btn-secondary ml-3 text-sm"
                    >
                        Suivant
                    </Link>
                ) : (
                    <span className="btn-secondary ml-3 cursor-not-allowed text-sm opacity-50">
                        Suivant
                    </span>
                )}
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <p className="text-sm text-dark-600">
                    Affichage de{' '}
                    <span className="font-medium">
                        {links.find((l) => l.active)?.label || '-'}
                    </span>{' '}
                    sur les résultats
                </p>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    {links.map((link, index) => {
                        if (link.label === '&laquo; Previous') {
                            return link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-dark-500 ring-1 ring-inset ring-dark-300 hover:bg-dark-50 focus:z-20"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </Link>
                            ) : (
                                <span
                                    key={index}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-dark-300 ring-1 ring-inset ring-dark-300"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </span>
                            );
                        }
                        if (link.label === 'Next &raquo;') {
                            return link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-dark-500 ring-1 ring-inset ring-dark-300 hover:bg-dark-50 focus:z-20"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </Link>
                            ) : (
                                <span
                                    key={index}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-dark-300 ring-1 ring-inset ring-dark-300"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </span>
                            );
                        }
                        return link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-dark-300 hover:bg-dark-50 focus:z-20 ${
                                    link.active
                                        ? 'bg-primary-600 text-white focus-visible:outline-primary-600'
                                        : 'text-dark-900'
                                }`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ) : (
                            <span
                                key={index}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-dark-300 ring-1 ring-inset ring-dark-300"
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
