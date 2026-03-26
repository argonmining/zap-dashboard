import { useState, useMemo } from 'react';
import { type BidInfo, EXPLORER_URL } from '../contracts';
import { fromQ96Price, fromQ96Amount, fromRawTokens, fmtNum, fmtPrice, fmtAddr } from '../format';

type Props = {
  bids: BidInfo[];
  clearingPrice: bigint;
};

type StatusFilter = 'all' | 'active' | 'outbid' | 'marginal' | 'exited';
type SortKey = 'bidId' | 'maxPrice' | 'deposit' | 'tokens' | 'spent';
type SortDir = 'asc' | 'desc';

function getBidStatus(bid: BidInfo): { label: string; color: string; bg: string } {
  if (bid.isExited) return { label: 'Exited', color: 'text-blue-400', bg: 'bg-blue-400/10' };
  if (bid.isFullyAboveClearing) return { label: 'Active', color: 'text-green-400', bg: 'bg-green-400/10' };
  if (bid.isMarginal) return { label: 'Marginal', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
  if (bid.isOutbid) return { label: 'Outbid', color: 'text-red-400', bg: 'bg-red-400/10' };
  return { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-400/10' };
}

function matchesFilter(bid: BidInfo, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') return bid.isFullyAboveClearing;
  if (filter === 'outbid') return bid.isOutbid;
  if (filter === 'marginal') return bid.isMarginal;
  if (filter === 'exited') return bid.isExited;
  return true;
}

export default function BidTable({ bids, clearingPrice }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('bidId');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  const clearingPriceNum = fromQ96Price(clearingPrice);

  const filteredBids = useMemo(() => {
    let result = bids.filter((b) => matchesFilter(b, filter));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bid.owner.toLowerCase().includes(q) ||
          b.bidId.toString().includes(q),
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'bidId':
          cmp = Number(a.bidId - b.bidId);
          break;
        case 'maxPrice':
          cmp = Number(a.bid.maxPrice - b.bid.maxPrice);
          break;
        case 'deposit':
          cmp = Number(a.bid.amountQ96 - b.bid.amountQ96);
          break;
        case 'tokens':
          cmp = Number(a.tokensAccumulated - b.tokensAccumulated);
          break;
        case 'spent':
          cmp = Number(a.currencySpentQ96 - b.currencySpentQ96);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [bids, filter, search, sortKey, sortDir]);

  const statusCounts = useMemo(() => {
    const c = { all: bids.length, active: 0, outbid: 0, marginal: 0, exited: 0 };
    for (const b of bids) {
      if (b.isExited) c.exited++;
      else if (b.isFullyAboveClearing) c.active++;
      else if (b.isMarginal) c.marginal++;
      else if (b.isOutbid) c.outbid++;
    }
    return c;
  }, [bids]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return '↕';
    return sortDir === 'desc' ? '↓' : '↑';
  };

  const totalDeposited = useMemo(
    () => bids.reduce((sum, b) => sum + fromQ96Amount(b.bid.amountQ96), 0),
    [bids],
  );
  const totalTokens = useMemo(
    () => bids.reduce((sum, b) => sum + fromRawTokens(b.tokensAccumulated), 0),
    [bids],
  );

  const filters: { key: StatusFilter; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: 'bg-gray-700' },
    { key: 'active', label: 'Active', color: 'bg-green-900' },
    { key: 'outbid', label: 'Outbid', color: 'bg-red-900' },
    { key: 'marginal', label: 'Marginal', color: 'bg-yellow-900' },
    { key: 'exited', label: 'Exited', color: 'bg-blue-900' },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Bid History</h2>
          <p className="text-xs text-gray-500">
            {bids.length} bids · {fmtNum(totalDeposited)} iKAS deposited · {fmtNum(totalTokens)} IGRA accumulated
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by address or bid ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-zap-purple w-64"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? `${f.color} text-white`
                : 'bg-gray-900 text-gray-500 hover:text-gray-300'
            }`}
          >
            {f.label} ({statusCounts[f.key]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900/50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-3 py-2.5 text-left cursor-pointer hover:text-gray-300" onClick={() => toggleSort('bidId')}>
                ID {sortIcon('bidId')}
              </th>
              <th className="px-3 py-2.5 text-left">Bidder</th>
              <th className="px-3 py-2.5 text-right cursor-pointer hover:text-gray-300" onClick={() => toggleSort('maxPrice')}>
                Max Price {sortIcon('maxPrice')}
              </th>
              <th className="px-3 py-2.5 text-right cursor-pointer hover:text-gray-300" onClick={() => toggleSort('deposit')}>
                Deposit {sortIcon('deposit')}
              </th>
              <th className="px-3 py-2.5 text-right cursor-pointer hover:text-gray-300" onClick={() => toggleSort('tokens')}>
                Tokens {sortIcon('tokens')}
              </th>
              <th className="px-3 py-2.5 text-right cursor-pointer hover:text-gray-300" onClick={() => toggleSort('spent')}>
                Spent {sortIcon('spent')}
              </th>
              <th className="px-3 py-2.5 text-right">Refund Est.</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="px-3 py-2.5 text-right">Block</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredBids.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-gray-600">
                  No bids match the current filter
                </td>
              </tr>
            )}
            {filteredBids.map((b) => {
              const status = getBidStatus(b);
              const maxPriceNum = fromQ96Price(b.bid.maxPrice);
              const deposit = fromQ96Amount(b.bid.amountQ96);
              const tokens = fromRawTokens(b.tokensAccumulated);
              const spent = fromQ96Amount(b.currencySpentQ96);
              const refund = Math.max(0, deposit - spent);
              const priceVsClearing = clearingPriceNum > 0
                ? ((maxPriceNum - clearingPriceNum) / clearingPriceNum * 100)
                : 0;

              return (
                <tr key={b.bidId.toString()} className="hover:bg-gray-900/30 transition-colors">
                  <td className="px-3 py-2 font-mono text-gray-400">
                    #{b.bidId.toString()}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={`${EXPLORER_URL}/address/${b.bid.owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-zap-purple-light hover:underline"
                    >
                      {fmtAddr(b.bid.owner)}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    <span>{fmtPrice(maxPriceNum)}</span>
                    {!b.isExited && (
                      <span className={`text-xs ml-1 ${priceVsClearing >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {priceVsClearing >= 0 ? '+' : ''}{priceVsClearing.toFixed(0)}%
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {fmtNum(deposit, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-green-400">
                    {fmtNum(tokens, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-orange-400">
                    {fmtNum(spent, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-gray-400">
                    {fmtNum(refund, 2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${status.color} ${status.bg}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a
                      href={`${EXPLORER_URL}/block/${b.bid.startBlock}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-gray-500 hover:text-gray-300"
                    >
                      {b.bid.startBlock.toLocaleString()}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      {filteredBids.length > 0 && (
        <div className="text-xs text-gray-600 text-right">
          Showing {filteredBids.length} of {bids.length} bids
          {clearingPriceNum > 0 && ` · Clearing price: ${fmtPrice(clearingPriceNum)} iKAS`}
        </div>
      )}
    </div>
  );
}
