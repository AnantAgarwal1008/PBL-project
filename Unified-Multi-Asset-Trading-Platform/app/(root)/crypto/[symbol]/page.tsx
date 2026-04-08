import { notFound } from 'next/navigation';
import TradingViewWidget from '@/components/TradingViewWidget';
import CryptoBuyPanel from '@/components/CryptoBuyPanel';
import { getCryptoQuote } from '@/lib/actions/finnhub.actions';
import { POPULAR_CRYPTO } from '@/lib/constants';
import {
    CRYPTO_CHART_WIDGET_CONFIG,
    CRYPTO_SYMBOL_INFO_CONFIG,
    CRYPTO_TECHNICAL_ANALYSIS_CONFIG,
} from '@/lib/constants';

interface CryptoDetailPageProps {
    params: Promise<{ symbol: string }>;
}

export default async function CryptoDetailPage({ params }: CryptoDetailPageProps) {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    const cryptoInfo = POPULAR_CRYPTO.find((c) => c.symbol === upperSymbol);
    if (!cryptoInfo) notFound();

    const finnhubSymbol = `${cryptoInfo.exchange}:${cryptoInfo.symbol}`;
    const tvSymbol = `${cryptoInfo.exchange}:${cryptoInfo.symbol}`;
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    const quote = await getCryptoQuote(finnhubSymbol);
    const currentPrice = quote?.price ?? null;
    const changePercent = quote?.changePercent ?? 0;
    const isPositive = changePercent >= 0;

    return (
        <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Left column */}
                <div className="flex flex-col gap-6">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}symbol-info.js`}
                        config={CRYPTO_SYMBOL_INFO_CONFIG(tvSymbol)}
                        height={170}
                    />

                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={CRYPTO_CHART_WIDGET_CONFIG(tvSymbol)}
                        className="custom-chart"
                        height={600}
                    />
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-white text-xl font-bold">{cryptoInfo.name}</h2>
                                <p className="text-gray-400 text-sm">{cryptoInfo.shortName} · {cryptoInfo.exchange}</p>
                            </div>
                        </div>
                        {currentPrice !== null && (
                            <div className="flex items-end gap-3 mt-2">
                                <span className="text-white text-3xl font-bold">
                                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                </span>
                                <span className={`text-sm font-medium mb-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                                </span>
                            </div>
                        )}
                    </div>

                    <CryptoBuyPanel
                        symbol={cryptoInfo.symbol}
                        name={cryptoInfo.name}
                        shortName={cryptoInfo.shortName}
                        finnhubSymbol={finnhubSymbol}
                        initialPrice={currentPrice}
                    />

                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}technical-analysis.js`}
                        config={CRYPTO_TECHNICAL_ANALYSIS_CONFIG(tvSymbol)}
                        height={400}
                    />
                </div>
            </section>
        </div>
    );
}
