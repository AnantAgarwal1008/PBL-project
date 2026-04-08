'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SellModal from '@/components/SellModal';
import Link from 'next/link';
import { TrendingUp, Bitcoin, TrendingDown } from 'lucide-react';

export default function PortfolioTable({ items }: PortfolioTableProps) {
    const [selling, setSelling] = useState<PortfolioItem | null>(null);
    const router = useRouter();
    const [, startTransition] = useTransition();

    const handleSold = () => {
        startTransition(() => router.refresh());
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
                <TrendingUp className="w-12 h-12 opacity-30" />
                <p className="text-lg">Your portfolio is empty.</p>
                <div className="flex gap-4 text-sm font-medium">
                    <Link href="/search" className="text-yellow-500 hover:text-yellow-400">Browse stocks &rarr;</Link>
                    <Link href="/crypto" className="text-orange-500 hover:text-orange-400">Browse crypto &rarr;</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                            <th className="text-left px-5 py-3 font-medium">Asset</th>
                            <th className="text-right px-5 py-3 font-medium">Qty</th>
                            <th className="text-right px-5 py-3 font-medium">Avg → Current</th>
                            <th className="text-right px-5 py-3 font-medium">Invested → Value</th>
                            <th className="text-right px-5 py-3 font-medium">Return</th>
                            <th className="text-right px-5 py-3 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const isCrypto = item.assetType === 'crypto';
                            const hasLiveData = item.currentPrice !== null;
                            const isProfit = (item.returnAmount ?? 0) >= 0;

                            const costBasis = item.purchasePrice * item.quantity;

                            const qtyDisplay = isCrypto
                                ? item.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })
                                : item.quantity.toLocaleString();

                            const fmtPrice = (p: number) =>
                                `$${p.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: isCrypto ? 6 : 2,
                                })}`;

                            const href = isCrypto
                                ? `/crypto/${item.symbol.replace('BINANCE:', '').replace('COINBASE:', '')}`
                                : `/stocks/${item.symbol}`;

                            const displayTicker = isCrypto
                                ? item.symbol.split(':')[1]?.replace('USDT', '') || item.symbol
                                : item.symbol;

                            return (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    {/* Asset */}
                                    <td className="px-5 py-4">
                                        <Link href={href} className="flex items-center gap-3 group">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isCrypto ? 'bg-orange-500/10' : 'bg-yellow-500/10'}`}>
                                                {isCrypto
                                                    ? <Bitcoin className="w-4 h-4 text-orange-400" />
                                                    : <TrendingUp className="w-4 h-4 text-yellow-400" />
                                                }
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-semibold group-hover:transition-colors ${isCrypto ? 'text-white group-hover:text-orange-400' : 'text-white group-hover:text-yellow-400'}`}>
                                                        {displayTicker}
                                                    </span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isCrypto ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {isCrypto ? 'Crypto' : 'Stock'}
                                                    </span>
                                                </div>
                                                <div className="text-gray-500 text-xs truncate max-w-[150px] mt-0.5">{item.company}</div>
                                            </div>
                                        </Link>
                                    </td>

                                    {/* Quantity */}
                                    <td className="px-5 py-4 text-right text-white font-medium">{qtyDisplay}</td>

                                    {/* Avg Price → Current Price */}
                                    <td className="px-5 py-4 text-right">
                                        <div className="text-gray-400 text-xs">{fmtPrice(item.purchasePrice)}</div>
                                        <div className={`font-semibold mt-0.5 ${hasLiveData ? (isProfit ? 'text-green-400' : 'text-red-400') : 'text-gray-500'}`}>
                                            {hasLiveData ? fmtPrice(item.currentPrice!) : '—'}
                                        </div>
                                    </td>

                                    {/* Invested → Current Value */}
                                    <td className="px-5 py-4 text-right">
                                        <div className="text-gray-400 text-xs">${costBasis.toFixed(2)}</div>
                                        <div className={`font-semibold mt-0.5 ${hasLiveData ? (isProfit ? 'text-green-400' : 'text-red-400') : 'text-gray-500'}`}>
                                            {hasLiveData ? `$${item.currentValue!.toFixed(2)}` : '—'}
                                        </div>
                                    </td>

                                    {/* Return */}
                                    <td className="px-5 py-4 text-right">
                                        {hasLiveData ? (
                                            <div className={`flex flex-col items-end ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                                <div className="flex items-center gap-1 font-semibold">
                                                    {isProfit
                                                        ? <TrendingUp className="w-3.5 h-3.5" />
                                                        : <TrendingDown className="w-3.5 h-3.5" />
                                                    }
                                                    {isProfit ? '+' : ''}${item.returnAmount!.toFixed(2)}
                                                </div>
                                                <div className="text-xs mt-0.5 opacity-80">
                                                    {isProfit ? '+' : ''}{item.returnPercent!.toFixed(2)}%
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 text-xs">No data</span>
                                        )}
                                    </td>

                                    {/* Action */}
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => setSelling(item)}
                                            className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs font-medium hover:bg-red-600/40 transition-colors border border-red-600/30"
                                        >
                                            Sell
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selling && (
                <SellModal
                    item={selling}
                    open={true}
                    onClose={() => setSelling(null)}
                    onSold={handleSold}
                />
            )}
        </>
    );
}
