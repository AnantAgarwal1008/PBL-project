'use client';

import { useState, useEffect } from 'react';
import { searchCryptos } from '@/lib/actions/finnhub.actions';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { Loader2, Bitcoin, Search } from 'lucide-react';

export default function CryptoSearchPage({ initialCryptos }: { initialCryptos: CryptoAsset[] }) {
    const [query, setQuery] = useState('');
    const [cryptos, setCryptos] = useState<CryptoAsset[]>(initialCryptos);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const results = await searchCryptos(query.trim() || undefined);
            setCryptos(results);
        } catch {
            setCryptos([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useDebounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [query]);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by name or symbol... (e.g. Bitcoin, BTC)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
            </div>

            <div className="text-xs text-gray-500 px-1">
                {loading ? 'Searching...' : `${cryptos.length} crypto${cryptos.length !== 1 ? 's' : ''} ${query ? `matching "${query}"` : '— popular cryptocurrencies'}`}
            </div>

            {!loading && cryptos.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-2 text-gray-500">
                    <Bitcoin className="w-8 h-8 opacity-30" />
                    <p>No cryptocurrencies found</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cryptos.map((crypto) => (
                    <Link
                        key={crypto.symbol}
                        href={`/crypto/${crypto.symbol}`}
                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-4 hover:border-orange-500/40 hover:bg-white/5 transition-all group"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 shrink-0">
                            <Bitcoin className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold group-hover:text-orange-400 transition-colors">{crypto.shortName}</div>
                            <div className="text-gray-400 text-xs">{crypto.name}</div>
                            <div className="text-gray-600 text-xs mt-0.5">{crypto.exchange} · Crypto</div>
                        </div>
                        <div className="text-gray-600 text-lg group-hover:text-orange-500 transition-colors">&rsaquo;</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
