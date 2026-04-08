import { searchCryptos } from '@/lib/actions/finnhub.actions';
import CryptoSearchPage from '@/components/CryptoSearchPage';

export default async function CryptoPage() {
    const initialCryptos = await searchCryptos();

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Crypto Markets</h1>
                <p className="text-gray-400 text-sm mt-1">Browse and buy cryptocurrencies — fractional amounts supported</p>
            </div>
            <CryptoSearchPage initialCryptos={initialCryptos} />
        </div>
    );
}
