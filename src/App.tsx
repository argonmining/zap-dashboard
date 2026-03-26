import { useEffect, useState, useCallback } from 'react';
import {
  fetchAuctionParams,
  fetchAuctionState,
  fetchBlockNumber,
  fetchKasPrice,
  type AuctionParams,
  type AuctionState,
  AUCTION_ADDRESS,
  EXPLORER_URL,
} from './contracts';
import { fmtAddr } from './format';
import StatsGrid from './components/StatsGrid';
import BidTable from './components/BidTable';

export default function App() {
  const [params, setParams] = useState<AuctionParams | null>(null);
  const [state, setState] = useState<AuctionState | null>(null);
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [kasPrice, setKasPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadParams = useCallback(async () => {
    try {
      const p = await fetchAuctionParams();
      setParams(p);
    } catch (e) {
      console.error('Failed to fetch params:', e);
      setError('Failed to fetch auction parameters from chain');
    }
  }, []);

  const loadState = useCallback(async () => {
    try {
      const s = await fetchAuctionState();
      setState(s);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      console.error('Failed to fetch state:', e);
      if (!state) setError('Failed to fetch auction state from chain');
    }
  }, [state]);

  const loadBlock = useCallback(async () => {
    try {
      const b = await fetchBlockNumber();
      setBlockNumber(b);
    } catch (e) {
      console.error('Failed to fetch block:', e);
    }
  }, []);

  const loadKasPrice = useCallback(async () => {
    const p = await fetchKasPrice();
    if (p) setKasPrice(p);
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadParams(), loadBlock(), loadKasPrice()]);
      await loadState();
      setLoading(false);
    })();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const stateInterval = setInterval(loadState, 15_000);
    const blockInterval = setInterval(loadBlock, 5_000);
    const priceInterval = setInterval(loadKasPrice, 60_000);
    return () => {
      clearInterval(stateInterval);
      clearInterval(blockInterval);
      clearInterval(priceInterval);
    };
  }, [loadState, loadBlock, loadKasPrice]);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zap-purple flex items-center justify-center text-white font-bold text-sm">
              Z
            </div>
            <div>
              <h1 className="text-base font-bold">ZAP Auction Dashboard</h1>
              <p className="text-xs text-gray-500">IGRA Token Continuous Clearing Auction</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="hidden sm:inline">
              Contract{' '}
              <a
                href={`${EXPLORER_URL}/address/${AUCTION_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-zap-purple-light hover:underline"
              >
                {fmtAddr(AUCTION_ADDRESS)}
              </a>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Igra Mainnet
            </span>
            {lastUpdated && (
              <span className="hidden md:inline">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && !state && (
          <div className="rounded-xl bg-red-950 border border-red-800 p-4 text-red-300 text-sm">
            {error}
            <button onClick={loadState} className="ml-2 underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-zap-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading auction data from Igra Mainnet...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <StatsGrid
              params={params}
              state={state}
              blockNumber={blockNumber}
              kasPrice={kasPrice}
            />

            {state && state.bids.length > 0 && (
              <BidTable
                bids={state.bids}
                clearingPrice={state.checkpoint.clearingPrice}
              />
            )}

            {state && state.bids.length === 0 && (
              <div className="rounded-xl bg-gray-900 border border-gray-800 p-8 text-center text-gray-500">
                No bids yet. The auction may not have started.
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
          <span>
            Data from{' '}
            <a href="https://rpc.igralabs.com:8545" className="hover:text-gray-400">Igra RPC</a>
            {' · '}
            <a href="https://auctions.zealousswap.com/auctions/igra" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
              Official Zealous Auction
            </a>
          </span>
          <span>
            <a href="https://zealous-auctions.gitbook.io/zealous-auctions-docs" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
              ZAP Docs
            </a>
            {' · '}
            <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
              Igra Explorer
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
