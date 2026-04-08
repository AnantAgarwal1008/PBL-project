import { searchStocks } from '@/lib/actions/finnhub.actions';
import SearchPage from '@/components/SearchPage';

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const initialStocks = await searchStocks(q || '');

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Search Stocks</h1>
                <p className="text-gray-400 text-sm mt-1">Find and buy stocks from global markets</p>
            </div>
            <SearchPage initialStocks={initialStocks} initialQuery={q || ''} />
        </div>
    );
}
