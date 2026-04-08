import { getPortfolio } from '@/lib/actions/portfolio.actions';
import PortfolioTable from '@/components/PortfolioTable';
import Link from 'next/link';

export default async function Portfolio() {
    const items = await getPortfolio();

    const totalInvested = items.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);
    const totalStocks = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
                    <p className="text-gray-400 text-sm mt-1">Your stock holdings at a glance</p>
                </div>
                <Link
                    href="/search"
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-400 transition-colors"
                >
                    + Buy Stocks
                </Link>
            </div>

            {items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
                        <p className="text-gray-400 text-sm">Total Invested</p>
                        <p className="text-white text-2xl font-bold mt-1">${totalInvested.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
                        <p className="text-gray-400 text-sm">Positions</p>
                        <p className="text-white text-2xl font-bold mt-1">{items.length}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
                        <p className="text-gray-400 text-sm">Total Shares</p>
                        <p className="text-white text-2xl font-bold mt-1">{totalStocks}</p>
                    </div>
                </div>
            )}

            <PortfolioTable items={items} />
        </div>
    );
}
