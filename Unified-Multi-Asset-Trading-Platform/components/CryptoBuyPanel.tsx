'use client';

import { useState } from 'react';
import { buyStock } from '@/lib/actions/portfolio.actions';
import { toast } from 'sonner';

interface CryptoBuyPanelProps {
    symbol: string;
    name: string;
    shortName: string;
    finnhubSymbol: string;
    initialPrice: number | null;
}

export default function CryptoBuyPanel({ symbol, name, shortName, finnhubSymbol, initialPrice }: CryptoBuyPanelProps) {
    const [quantity, setQuantity] = useState<string>('1');
    const [loading, setLoading] = useState(false);

    const marketPrice = initialPrice ?? 0;
    const qty = parseFloat(quantity) || 0;
    const totalCost = Math.round(marketPrice * qty * 100) / 100;

    const handleBuy = async () => {
        const parsedQty = parseFloat(quantity);
        if (!parsedQty || parsedQty <= 0) { toast.error('Enter a valid quantity'); return; }
        if (marketPrice <= 0) { toast.error('Price is not available'); return; }

        setLoading(true);
        try {
            await buyStock({
                symbol: finnhubSymbol,
                company: name,
                quantity: parsedQty,
                purchasePrice: marketPrice,
                purchaseType: 'market',
                assetType: 'crypto',
            });
            toast.success(`Bought ${parsedQty} ${shortName} at $${marketPrice.toLocaleString()}`);
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to buy crypto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">Buy {shortName}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">Market</span>
            </div>

            <div className="flex items-center justify-between text-sm border border-white/10 rounded-lg px-4 py-3 bg-[#111]">
                <span className="text-gray-400">Market Price</span>
                <span className="text-white font-semibold">
                    {marketPrice > 0 ? `$${marketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}` : 'Unavailable'}
                </span>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Quantity (fractional allowed, e.g. 0.001)</label>
                <input
                    type="number"
                    min="0.000001"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 0.5"
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>

            <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
                <span className="text-gray-400">Estimated Total</span>
                <span className="text-white font-semibold">
                    {marketPrice > 0 && qty > 0 ? `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                </span>
            </div>

            <button
                onClick={handleBuy}
                disabled={loading || marketPrice === 0}
                className="w-full py-2.5 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Buying...' : `Buy ${shortName}`}
            </button>
        </div>
    );
}
