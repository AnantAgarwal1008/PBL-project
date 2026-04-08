'use client';

import { useState, useEffect } from 'react';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { Loader2, TrendingUp, Search } from 'lucide-react';

export default function SearchPage({ initialStocks, initialQuery }: { initialStocks: StockWithWatchlistStatus[]; initialQuery: string }) {
    const [query, setQuery] = useState(initialQuery);
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const results = await searchStocks(query.trim() || undefined);
            setStocks(results);
        } catch {
            setStocks([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useDebounce(handleSearch, 350);

    useEffect(() => {
        debouncedSearch();
    }, [query]);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
                {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
            </div>

            <div className="text-xs text-gray-500 px-1">
                {loading ? 'Searching...' : `${stocks.length} result${stocks.length !== 1 ? 's' : ''} ${query ? `for "${query}"` : '— popular stocks'}`}
            </div>

            {!loading && stocks.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-2 text-gray-500">
                    <TrendingUp className="w-8 h-8 opacity-30" />
                    <p>No stocks found</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stocks.map((stock) => (
                    <Link
                        key={stock.symbol}
                        href={`/stocks/${stock.symbol}`}
                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-4 hover:border-yellow-500/40 hover:bg-white/5 transition-all group"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10 shrink-0">
                            <TrendingUp className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold group-hover:text-yellow-400 transition-colors">{stock.symbol}</div>
                            <div className="text-gray-400 text-xs truncate">{stock.name}</div>
                            <div className="text-gray-600 text-xs mt-0.5">{stock.exchange} · {stock.type}</div>
                        </div>
                        <div className="text-gray-600 text-lg group-hover:text-yellow-500 transition-colors">&rsaquo;</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
