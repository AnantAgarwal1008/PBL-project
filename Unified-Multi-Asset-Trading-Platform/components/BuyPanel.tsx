'use client';

import { useState } from 'react';
import { buyStock } from '@/lib/actions/portfolio.actions';
import { toast } from 'sonner';

export default function BuyPanel({ symbol, company, initialPrice }: BuyPanelProps) {
    const [tab, setTab] = useState<'market' | 'limit'>('market');
    const [quantity, setQuantity] = useState(1);
    const [limitPrice, setLimitPrice] = useState<number>(initialPrice ?? 0);
    const [loading, setLoading] = useState(false);

    const marketPrice = initialPrice ?? 0;
    const upperLimit = Math.round(marketPrice * 1.05 * 100) / 100;
    const lowerLimit = Math.round(marketPrice * 0.95 * 100) / 100;

    const effectivePrice = tab === 'market' ? marketPrice : limitPrice;
    const totalCost = Math.round(effectivePrice * quantity * 100) / 100;

    const handleBuy = async () => {
        if (quantity <= 0) { toast.error('Quantity must be at least 1'); return; }
        if (effectivePrice <= 0) { toast.error('Price is not available'); return; }
        if (tab === 'limit' && (limitPrice < lowerLimit || limitPrice > upperLimit)) {
            toast.error(`Limit price must be between $${lowerLimit} and $${upperLimit}`);
            return;
        }
        setLoading(true);
        try {
            await buyStock({ symbol, company, quantity, purchasePrice: effectivePrice, purchaseType: tab });
            toast.success(`Bought ${quantity} share${quantity > 1 ? 's' : ''} of ${symbol} at $${effectivePrice}`);
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to buy stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 flex flex-col gap-4">
            <h3 className="text-white font-semibold text-lg">Buy {symbol}</h3>

            <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                    onClick={() => setTab('market')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'market' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Market
                </button>
                <button
                    onClick={() => setTab('limit')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'limit' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Limit
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {tab === 'market' ? (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Market Price</span>
                        <span className="text-white font-semibold">
                            {marketPrice > 0 ? `$${marketPrice.toFixed(2)}` : 'Unavailable'}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Limit Range</span>
                            <span className="text-gray-300 text-xs">${lowerLimit} – ${upperLimit}</span>
                        </div>
                        <label className="text-sm text-gray-400">Limit Price ($)</label>
                        <input
                            type="number"
                            min={lowerLimit}
                            max={upperLimit}
                            step="0.01"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                        />
                        {limitPrice > 0 && (limitPrice < lowerLimit || limitPrice > upperLimit) && (
                            <p className="text-red-400 text-xs">Price must be within ±5% of market price</p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Quantity</label>
                    <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                    />
                </div>

                <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3 mt-1">
                    <span className="text-gray-400">Estimated Total</span>
                    <span className="text-white font-semibold">{effectivePrice > 0 ? `$${totalCost.toFixed(2)}` : '—'}</span>
                </div>
            </div>

            <button
                onClick={handleBuy}
                disabled={loading || marketPrice === 0}
                className="w-full py-2.5 rounded-lg bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Buying...' : `Buy ${symbol}`}
            </button>
        </div>
    );
}
