'use client';

import { useState } from 'react';
import { sellStock } from '@/lib/actions/portfolio.actions';
import { toast } from 'sonner';

export default function SellModal({ item, open, onClose, onSold }: SellModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSell = async () => {
        if (quantity <= 0) { toast.error('Quantity must be at least 1'); return; }
        if (quantity > item.quantity) { toast.error(`You only have ${item.quantity} shares`); return; }

        setLoading(true);
        try {
            await sellStock({ symbol: item.symbol, quantity });
            toast.success(`Sold ${quantity} share${quantity > 1 ? 's' : ''} of ${item.symbol}`);
            onSold();
            onClose();
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to sell stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Sell {item.symbol}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Company</span>
                        <span className="text-white">{item.company}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Shares held</span>
                        <span className="text-white">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Avg. purchase price</span>
                        <span className="text-white">${item.purchasePrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Shares to sell (max {item.quantity})</label>
                    <input
                        type="number"
                        min={1}
                        max={item.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-300 text-sm hover:text-white hover:border-white/30 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSell}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Selling...' : 'Confirm Sell'}
                    </button>
                </div>
            </div>
        </div>
    );
}
