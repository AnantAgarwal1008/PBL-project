'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SellModal from '@/components/SellModal';
import Link from 'next/link';
import { TrendingUp, Bitcoin } from 'lucide-react';

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
                            <th className="text-right px-5 py-3 font-medium">Quantity</th>
                            <th className="text-right px-5 py-3 font-medium">Avg. Price</th>
                            <th className="text-right px-5 py-3 font-medium">Total Cost</th>
                            <th className="text-right px-5 py-3 font-medium">Type</th>
                            <th className="text-right px-5 py-3 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const isCrypto = item.assetType === 'crypto';
                            const totalCost = (item.purchasePrice * item.quantity).toFixed(2);
                            const qtyDisplay = isCrypto
                                ? item.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })
                                : item.quantity.toLocaleString();
                            const priceDisplay = `$${item.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: isCrypto ? 6 : 2 })}`;
                            const href = isCrypto
                                ? `/crypto/${item.symbol.replace('BINANCE:', '').replace('COINBASE:', '')}`
                                : `/stocks/${item.symbol}`;

                            return (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-4">
                                        <Link href={href} className="flex items-center gap-3 group">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isCrypto ? 'bg-orange-500/10' : 'bg-yellow-500/10'}`}>
                                                {isCrypto
                                                    ? <Bitcoin className="w-4 h-4 text-orange-400" />
                                                    : <TrendingUp className="w-4 h-4 text-yellow-400" />
                                                }
                                            </div>
                                            <div>
                                                <span className={`font-semibold group-hover:transition-colors ${isCrypto ? 'text-white group-hover:text-orange-400' : 'text-white group-hover:text-yellow-400'}`}>
                                                    {isCrypto ? item.symbol.split(':')[1]?.replace('USDT', '') || item.symbol : item.symbol}
                                                </span>
                                                <div className="text-gray-500 text-xs truncate max-w-[160px]">{item.company}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-5 py-4 text-right text-white font-medium">{qtyDisplay}</td>
                                    <td className="px-5 py-4 text-right text-white">{priceDisplay}</td>
                                    <td className="px-5 py-4 text-right text-white">${totalCost}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCrypto ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {isCrypto ? 'Crypto' : 'Stock'}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/5 text-gray-500">
                                                {item.purchaseType}
                                            </span>
                                        </div>
                                    </td>
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
