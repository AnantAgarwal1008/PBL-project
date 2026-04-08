import { getPortfolio } from '@/lib/actions/portfolio.actions';
import PortfolioTable from '@/components/PortfolioTable';
import Link from 'next/link';

export default async function Portfolio() {
    const items = await getPortfolio();

    const totalInvested = items.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);
    const stockItems = items.filter((i) => i.assetType === 'stock');
    const cryptoItems = items.filter((i) => i.assetType === 'crypto');

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
                    <p className="text-gray-400 text-sm mt-1">Your stocks and crypto holdings</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/crypto"
                        className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors"
                    >
                        + Crypto
                    </Link>
                    <Link
                        href="/search"
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-400 transition-colors"
                    >
                        + Stocks
                    </Link>
                </div>
            </div>

            {items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
                        <p className="text-gray-400 text-sm">Total Invested</p>
                        <p className="text-white text-2xl font-bold mt-1">${totalInvested.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
                        <p className="text-gray-400 text-sm">Positions</p>
                        <p className="text-white text-2xl font-bold mt-1">{items.length}</p>
                    </div>
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                        <p className="text-yellow-400/70 text-sm">Stock Holdings</p>
                        <p className="text-yellow-400 text-2xl font-bold mt-1">{stockItems.length}</p>
                    </div>
                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
                        <p className="text-orange-400/70 text-sm">Crypto Holdings</p>
                        <p className="text-orange-400 text-2xl font-bold mt-1">{cryptoItems.length}</p>
                    </div>
                </div>
            )}

            <PortfolioTable items={items} />
        </div>
    );
}
