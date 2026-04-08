'use client';

import { useState } from 'react';
import { sellStock } from '@/lib/actions/portfolio.actions';
import { toast } from 'sonner';

export default function SellModal({ item, open, onClose, onSold }: SellModalProps) {
    const [quantity, setQuantity] = useState<string>(item.assetType === 'crypto' ? '0.1' : '1');
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const isCrypto = item.assetType === 'crypto';
    const parsedQty = parseFloat(quantity) || 0;
    const maxQty = item.quantity;

    const displaySymbol = isCrypto
        ? item.symbol.split(':')[1]?.replace('USDT', '') || item.symbol
        : item.symbol;

    const handleSell = async () => {
        if (parsedQty <= 0) { toast.error('Quantity must be greater than 0'); return; }
        if (parsedQty > maxQty) { toast.error(`You only have ${maxQty} ${isCrypto ? 'units' : 'shares'}`); return; }

        setLoading(true);
        try {
            await sellStock({ symbol: item.symbol, quantity: parsedQty });
            toast.success(`Sold ${parsedQty} ${displaySymbol}`);
            onSold();
            onClose();
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to sell');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Sell {displaySymbol}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
                </div>

                <div className="flex flex-col gap-1.5 text-sm bg-[#111] rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Asset</span>
                        <span className="text-white">{item.company}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">{isCrypto ? 'Units held' : 'Shares held'}</span>
                        <span className="text-white">{maxQty.toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Avg. purchase price</span>
                        <span className="text-white">${item.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: isCrypto ? 6 : 2 })}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">
                        {isCrypto ? `Amount to sell (max ${maxQty.toLocaleString(undefined, { maximumFractionDigits: 8 })})` : `Shares to sell (max ${maxQty})`}
                    </label>
                    <input
                        type="number"
                        min={isCrypto ? '0.000001' : '1'}
                        max={maxQty}
                        step={isCrypto ? 'any' : '1'}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {parsedQty > maxQty && (
                        <p className="text-red-400 text-xs">Exceeds your holdings</p>
                    )}
                </div>

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-300 text-sm hover:text-white hover:border-white/30 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSell}
                        disabled={loading || parsedQty <= 0 || parsedQty > maxQty}
                        className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Selling...' : 'Confirm Sell'}
                    </button>
                </div>
            </div>
        </div>
    );
}
