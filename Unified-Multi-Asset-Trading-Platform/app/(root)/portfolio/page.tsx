import { getPortfolio } from '@/lib/actions/portfolio.actions';
import { getStockQuote, getCryptoQuote } from '@/lib/actions/finnhub.actions';
import PortfolioTable from '@/components/PortfolioTable';
import Link from 'next/link';

export default async function Portfolio() {
    const items = await getPortfolio();

    const enrichedItems: EnrichedPortfolioItem[] = await Promise.all(
        items.map(async (item) => {
            try {
                const quote =
                    item.assetType === 'crypto'
                        ? await getCryptoQuote(item.symbol)
                        : await getStockQuote(item.symbol);

                const currentPrice = quote?.price ?? null;
                const costBasis = item.purchasePrice * item.quantity;
                const currentValue = currentPrice !== null ? currentPrice * item.quantity : null;
                const returnAmount = currentValue !== null ? currentValue - costBasis : null;
                const returnPercent =
                    returnAmount !== null && costBasis > 0
                        ? (returnAmount / costBasis) * 100
                        : null;

                return { ...item, currentPrice, currentValue, returnAmount, returnPercent };
            } catch {
                return { ...item, currentPrice: null, currentValue: null, returnAmount: null, returnPercent: null };
            }
        })
    );

    const totalInvested = enrichedItems.reduce((s, i) => s + i.purchasePrice * i.quantity, 0);
    const totalCurrentValue = enrichedItems.reduce(
        (s, i) => (i.currentValue !== null ? s + i.currentValue : s),
        0
    );
    const totalReturn = totalCurrentValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const isProfit = totalReturn >= 0;

    const stockItems = enrichedItems.filter((i) => i.assetType === 'stock');
    const cryptoItems = enrichedItems.filter((i) => i.assetType === 'crypto');

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
                    <p className="text-gray-400 text-sm mt-1">Your stocks and crypto holdings with live P&amp;L</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/crypto" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors">
                        + Crypto
                    </Link>
                    <Link href="/search" className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-400 transition-colors">
                        + Stocks
                    </Link>
                </div>
            </div>

            {enrichedItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
                        <p className="text-gray-400 text-sm">Total Invested</p>
                        <p className="text-white text-2xl font-bold mt-1">${totalInvested.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
                        <p className="text-gray-400 text-sm">Current Value</p>
                        <p className="text-white text-2xl font-bold mt-1">${totalCurrentValue.toFixed(2)}</p>
                    </div>
                    <div className={`rounded-xl border p-5 ${isProfit ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                        <p className={`text-sm ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>Total Return</p>
                        <p className={`text-2xl font-bold mt-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}${totalReturn.toFixed(2)}
                        </p>
                        <p className={`text-xs mt-0.5 ${isProfit ? 'text-green-500/70' : 'text-red-500/70'}`}>
                            {isProfit ? '+' : ''}{totalReturnPercent.toFixed(2)}%
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
                        <p className="text-gray-400 text-sm">Positions</p>
                        <p className="text-white text-2xl font-bold mt-1">{enrichedItems.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stockItems.length} stocks · {cryptoItems.length} crypto</p>
                    </div>
                </div>
            )}

            <PortfolioTable items={enrichedItems} />
        </div>
    );
}
