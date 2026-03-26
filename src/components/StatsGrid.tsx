import { type AuctionParams, type AuctionState, EXPLORER_URL, SOLD_SUPPLY, REQUIRED_RAISE_IKAS } from '../contracts';
import { fromQ96Price, fromQ96Amount, fromWei, fromRawTokens, fmtNum, fmtPrice, fmtBlocks } from '../format';

type Props = {
  params: AuctionParams | null;
  state: AuctionState | null;
  blockNumber: bigint | null;
  kasPrice: number | null;
};

function getPhase(
  currentBlock: bigint,
  startBlock: bigint,
  endBlock: bigint,
  claimBlock: bigint,
): { label: string; color: string } {
  if (currentBlock < startBlock) return { label: 'Not Started', color: 'text-gray-400' };
  if (currentBlock < endBlock) return { label: 'Active', color: 'text-green-400' };
  if (currentBlock < claimBlock) return { label: 'Ended', color: 'text-yellow-400' };
  return { label: 'Claim Period', color: 'text-blue-400' };
}

function Stat({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const content = (
    <div className="h-full rounded-xl bg-gray-900 border border-gray-800 p-4 hover:border-gray-700 transition-colors">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold font-mono truncate">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>}
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">{content}</a>;
  return content;
}

export default function StatsGrid({ params, state, blockNumber, kasPrice }: Props) {
  if (!params || !state) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const clearingPrice = fromQ96Price(state.checkpoint.clearingPrice);
  const floorPrice = fromQ96Price(params.floorPrice);
  const maxBidPrice = fromQ96Price(params.maxBidPrice);
  const maxBidPriceCapped = maxBidPrice > 1_000_000;
  const tickSpacing = fromQ96Price(params.tickSpacing);
  const currencyRaised = fromWei(state.currencyRaised);
  const totalCleared = fromRawTokens(state.totalCleared);
  const totalSupply = fromRawTokens(params.totalSupply);
  const currentBlock = blockNumber ?? 0n;

  const phase = getPhase(currentBlock, params.startBlock, params.endBlock, params.claimBlock);

  const blocksToEnd = currentBlock < params.endBlock
    ? Number(params.endBlock - currentBlock)
    : 0;
  const blocksToClaim = currentBlock < params.claimBlock
    ? Number(params.claimBlock - currentBlock)
    : 0;

  const fundingPct = (currencyRaised / REQUIRED_RAISE_IKAS) * 100;
  const supplyPct = totalSupply > 0 ? (totalCleared / totalSupply) * 100 : 0;
  const demandAboveClearing = fromQ96Amount(state.sumCurrencyDemandAboveClearingQ96);

  const activeBids = state.bids.filter(b => b.isFullyAboveClearing).length;
  const uniqueBidders = new Set(state.bids.map(b => b.bid.owner)).size;
  const avgPrice = state.bids.length > 0
    ? state.bids.reduce((sum, b) => sum + fromQ96Price(b.bid.maxPrice), 0) / state.bids.length
    : 0;

  const clearingUsd = kasPrice ? clearingPrice * kasPrice : null;

  return (
    <div className="space-y-4">
      {/* Phase Banner */}
      <div className="flex items-center justify-between rounded-xl bg-gray-900 border border-gray-800 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${phase.color}`}>
            {phase.label === 'Active' && <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />}
            {phase.label}
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-sm text-gray-400 font-mono">
            Block {currentBlock.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {blocksToEnd > 0 && (
            <span>Ends in <span className="text-white font-mono">{fmtBlocks(blocksToEnd)}</span></span>
          )}
          {blocksToEnd === 0 && blocksToClaim > 0 && (
            <span>Claim in <span className="text-white font-mono">{fmtBlocks(blocksToClaim)}</span></span>
          )}
          <a
            href={`${EXPLORER_URL}/block/${currentBlock}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zap-purple-light hover:underline"
          >
            Explorer
          </a>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Funding Progress</span>
            <span>{fundingPct < 1 ? fundingPct.toFixed(2) : fmtNum(fundingPct, 1)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-zap-purple to-zap-purple-light rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fundingPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{fmtNum(currencyRaised)} iKAS raised</span>
            <span>{fmtNum(REQUIRED_RAISE_IKAS)} iKAS goal</span>
          </div>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Supply Cleared</span>
            <span>{supplyPct < 1 ? supplyPct.toFixed(4) : fmtNum(supplyPct, 1)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(supplyPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{fmtNum(totalCleared)} IGRA cleared</span>
            <span>{fmtNum(totalSupply)} IGRA total</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Clearing Price"
          value={`${fmtPrice(clearingPrice)} iKAS`}
          sub={clearingUsd ? `$${fmtPrice(clearingUsd)}` : undefined}
        />
        <Stat
          label="Floor Price"
          value={`${fmtPrice(floorPrice)} iKAS`}
          sub={kasPrice ? `$${fmtPrice(floorPrice * kasPrice)}` : undefined}
        />
        <Stat
          label="Max Bid Price"
          value={maxBidPriceCapped ? 'Uncapped' : `${fmtPrice(maxBidPrice)} iKAS`}
          sub={maxBidPriceCapped ? 'No upper price limit' : undefined}
        />
        <Stat
          label="Tick Spacing"
          value={`${tickSpacing.toFixed(4)} iKAS`}
        />
        <Stat
          label="Currency Raised"
          value={`${fmtNum(currencyRaised)} iKAS`}
          sub={kasPrice ? `$${fmtNum(currencyRaised * kasPrice)}` : undefined}
        />
        <Stat
          label="Graduated"
          value={state.isGraduated ? 'Yes' : 'No'}
          sub={state.isGraduated ? 'Soft cap met' : `${fundingPct < 1 ? fundingPct.toFixed(2) : fmtNum(fundingPct, 1)}% of goal`}
        />
        <Stat
          label="Total Bids"
          value={state.bids.length.toLocaleString()}
          sub={`${activeBids} active`}
        />
        <Stat
          label="Demand Above Clearing"
          value={`${fmtNum(demandAboveClearing)} iKAS`}
          sub={`Avg max price: ${fmtPrice(avgPrice)} iKAS`}
        />
        <Stat
          label="Total Supply (Auction)"
          value={`${fmtNum(totalSupply)} IGRA`}
          sub={`${fmtNum(SOLD_SUPPLY)} of ${fmtNum(10_000_000_000)} total`}
        />
        <Stat
          label="Tokens Cleared"
          value={`${fmtNum(totalCleared)} IGRA`}
        />
        <Stat
          label="Start Block"
          value={params.startBlock.toLocaleString()}
          href={`${EXPLORER_URL}/block/${params.startBlock}`}
        />
        <Stat
          label="End Block"
          value={params.endBlock.toLocaleString()}
          sub={blocksToEnd > 0 ? `${fmtBlocks(blocksToEnd)} remaining` : 'Auction ended'}
        />
        <Stat
          label="Claim Block"
          value={params.claimBlock.toLocaleString()}
          sub={blocksToClaim > 0 ? `${fmtBlocks(blocksToClaim)} until claim` : 'Claims open'}
        />
        <Stat
          label="Unique Bidders"
          value={uniqueBidders.toLocaleString()}
          sub={`${(state.bids.length / uniqueBidders).toFixed(1)} bids per bidder`}
        />
        <Stat
          label="Currency"
          value={params.currency === '0x0000000000000000000000000000000000000000' ? 'iKAS (Native)' : 'ERC20'}
          sub="Payment currency"
        />
        <Stat
          label="Avg Deposit"
          value={`${fmtNum(currencyRaised / state.bids.length, 2)} iKAS`}
          sub="Per bid"
        />
      </div>

      {/* KAS Price */}
      {kasPrice && (
        <div className="text-xs text-gray-600 text-right">
          KAS/USD: ${kasPrice.toFixed(4)} via CoinGecko
        </div>
      )}
    </div>
  );
}
