'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SellModal from '@/components/SellModal';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
                <Link href="/search" className="text-yellow-500 hover:text-yellow-400 text-sm font-medium">Browse stocks to buy &rarr;</Link>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                            <th className="text-left px-5 py-3 font-medium">Stock</th>
                            <th className="text-right px-5 py-3 font-medium">Shares</th>
                            <th className="text-right px-5 py-3 font-medium">Avg. Price</th>
                            <th className="text-right px-5 py-3 font-medium">Total Cost</th>
                            <th className="text-right px-5 py-3 font-medium">Type</th>
                            <th className="text-right px-5 py-3 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const totalCost = (item.purchasePrice * item.quantity).toFixed(2);
                            return (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-4">
                                        <Link href={`/stocks/${item.symbol}`} className="flex flex-col group">
                                            <span className="text-white font-semibold group-hover:text-yellow-400 transition-colors">{item.symbol}</span>
                                            <span className="text-gray-500 text-xs truncate max-w-[180px]">{item.company}</span>
                                        </Link>
                                    </td>
                                    <td className="px-5 py-4 text-right text-white font-medium">{item.quantity}</td>
                                    <td className="px-5 py-4 text-right text-white">${item.purchasePrice.toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-white">${totalCost}</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.purchaseType === 'market' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                            {item.purchaseType}
                                        </span>
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
