import { createPublicClient, http, defineChain, type Address } from 'viem';

export const AUCTION_ADDRESS: Address = '0xa1ae5E85551F0093696f32BE6952c2bb23D3068B';
export const QUERY_ADDRESS: Address = '0xf40178040278E16c8813dB20a84119A605812FB3';
export const IGRA_TOKEN: Address = '0x093d77d397F8acCbaee0820345E9E700B1233cD1';
export const EXPLORER_URL = 'https://explorer.igralabs.com';
export const SOLD_SUPPLY = 350_000_000;
export const REQUIRED_RAISE_IKAS = 4_100_000;

export const igra = defineChain({
  id: 38833,
  name: 'Igra Mainnet',
  nativeCurrency: { name: 'iKAS', symbol: 'iKAS', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.igralabs.com:8545'] } },
  blockExplorers: { default: { name: 'Igra Explorer', url: EXPLORER_URL } },
});

export const client = createPublicClient({
  chain: igra,
  transport: http(),
});

export const queryAbi = [
  {
    name: 'queryBids',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'auction', type: 'address' },
      { name: 'bidIds', type: 'uint256[]' },
    ],
    outputs: [
      {
        name: 'result',
        type: 'tuple',
        components: [
          {
            name: 'checkpoint',
            type: 'tuple',
            components: [
              { name: 'clearingPrice', type: 'uint256' },
              { name: 'currencyRaisedAtClearingPriceQ96_X7', type: 'uint256' },
              { name: 'cumulativeMpsPerPrice', type: 'uint256' },
              { name: 'cumulativeMps', type: 'uint24' },
              { name: 'prev', type: 'uint64' },
              { name: 'next', type: 'uint64' },
            ],
          },
          { name: 'currencyRaised', type: 'uint256' },
          { name: 'totalCleared', type: 'uint256' },
          { name: 'isGraduated', type: 'bool' },
          { name: 'startBlock', type: 'uint64' },
          { name: 'endBlock', type: 'uint64' },
          { name: 'claimBlock', type: 'uint64' },
          { name: 'sumCurrencyDemandAboveClearingQ96', type: 'uint256' },
          {
            name: 'bids',
            type: 'tuple[]',
            components: [
              { name: 'bidId', type: 'uint256' },
              {
                name: 'bid',
                type: 'tuple',
                components: [
                  { name: 'startBlock', type: 'uint64' },
                  { name: 'startCumulativeMps', type: 'uint24' },
                  { name: 'exitedBlock', type: 'uint64' },
                  { name: 'maxPrice', type: 'uint256' },
                  { name: 'owner', type: 'address' },
                  { name: 'amountQ96', type: 'uint256' },
                  { name: 'tokensFilled', type: 'uint256' },
                ],
              },
              { name: 'tokensAccumulated', type: 'uint256' },
              { name: 'currencySpentQ96', type: 'uint256' },
              { name: 'isFullyAboveClearing', type: 'bool' },
              { name: 'isOutbid', type: 'bool' },
              { name: 'isMarginal', type: 'bool' },
              { name: 'isExited', type: 'bool' },
              { name: 'lastFullyFilledCheckpointBlock', type: 'uint64' },
              { name: 'outbidBlock', type: 'uint64' },
              { name: 'marginalCheckpointBlock', type: 'uint64' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'queryLastBids',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'auction', type: 'address' },
      { name: 'count', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'result',
        type: 'tuple',
        components: [
          {
            name: 'checkpoint',
            type: 'tuple',
            components: [
              { name: 'clearingPrice', type: 'uint256' },
              { name: 'currencyRaisedAtClearingPriceQ96_X7', type: 'uint256' },
              { name: 'cumulativeMpsPerPrice', type: 'uint256' },
              { name: 'cumulativeMps', type: 'uint24' },
              { name: 'prev', type: 'uint64' },
              { name: 'next', type: 'uint64' },
            ],
          },
          { name: 'currencyRaised', type: 'uint256' },
          { name: 'totalCleared', type: 'uint256' },
          { name: 'isGraduated', type: 'bool' },
          { name: 'startBlock', type: 'uint64' },
          { name: 'endBlock', type: 'uint64' },
          { name: 'claimBlock', type: 'uint64' },
          { name: 'sumCurrencyDemandAboveClearingQ96', type: 'uint256' },
          {
            name: 'bids',
            type: 'tuple[]',
            components: [
              { name: 'bidId', type: 'uint256' },
              {
                name: 'bid',
                type: 'tuple',
                components: [
                  { name: 'startBlock', type: 'uint64' },
                  { name: 'startCumulativeMps', type: 'uint24' },
                  { name: 'exitedBlock', type: 'uint64' },
                  { name: 'maxPrice', type: 'uint256' },
                  { name: 'owner', type: 'address' },
                  { name: 'amountQ96', type: 'uint256' },
                  { name: 'tokensFilled', type: 'uint256' },
                ],
              },
              { name: 'tokensAccumulated', type: 'uint256' },
              { name: 'currencySpentQ96', type: 'uint256' },
              { name: 'isFullyAboveClearing', type: 'bool' },
              { name: 'isOutbid', type: 'bool' },
              { name: 'isMarginal', type: 'bool' },
              { name: 'isExited', type: 'bool' },
              { name: 'lastFullyFilledCheckpointBlock', type: 'uint64' },
              { name: 'outbidBlock', type: 'uint64' },
              { name: 'marginalCheckpointBlock', type: 'uint64' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'getAuctionParams',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'auction', type: 'address' }],
    outputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'startBlock', type: 'uint64' },
          { name: 'endBlock', type: 'uint64' },
          { name: 'claimBlock', type: 'uint64' },
          { name: 'currency', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'tickSpacing', type: 'uint256' },
          { name: 'floorPrice', type: 'uint256' },
          { name: 'totalSupply', type: 'uint128' },
          { name: 'maxBidPrice', type: 'uint256' },
        ],
      },
    ],
  },
] as const;

export const auctionAbi = [
  {
    name: 'nextBidId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'clearingPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export type AuctionParams = {
  startBlock: bigint;
  endBlock: bigint;
  claimBlock: bigint;
  currency: Address;
  token: Address;
  tickSpacing: bigint;
  floorPrice: bigint;
  totalSupply: bigint;
  maxBidPrice: bigint;
};

export type BidInfo = {
  bidId: bigint;
  bid: {
    startBlock: bigint;
    startCumulativeMps: number;
    exitedBlock: bigint;
    maxPrice: bigint;
    owner: Address;
    amountQ96: bigint;
    tokensFilled: bigint;
  };
  tokensAccumulated: bigint;
  currencySpentQ96: bigint;
  isFullyAboveClearing: boolean;
  isOutbid: boolean;
  isMarginal: boolean;
  isExited: boolean;
  lastFullyFilledCheckpointBlock: bigint;
  outbidBlock: bigint;
  marginalCheckpointBlock: bigint;
};

export type AuctionState = {
  checkpoint: {
    clearingPrice: bigint;
  };
  currencyRaised: bigint;
  totalCleared: bigint;
  isGraduated: boolean;
  startBlock: bigint;
  endBlock: bigint;
  claimBlock: bigint;
  sumCurrencyDemandAboveClearingQ96: bigint;
  bids: BidInfo[];
};

const BATCH_SIZE = 30;

export async function fetchAuctionParams(): Promise<AuctionParams> {
  const result = await client.readContract({
    address: QUERY_ADDRESS,
    abi: queryAbi,
    functionName: 'getAuctionParams',
    args: [AUCTION_ADDRESS],
  });
  return result as unknown as AuctionParams;
}

export async function fetchAuctionState(): Promise<AuctionState> {
  try {
    const result = await client.readContract({
      address: QUERY_ADDRESS,
      abi: queryAbi,
      functionName: 'queryLastBids',
      args: [AUCTION_ADDRESS, 10000n],
    });
    return result as unknown as AuctionState;
  } catch {
    return await fetchAuctionStateBatched();
  }
}

async function fetchAuctionStateBatched(): Promise<AuctionState> {
  const nextId = await client.readContract({
    address: AUCTION_ADDRESS,
    abi: auctionAbi,
    functionName: 'nextBidId',
  });

  const count = Number(nextId);
  if (count === 0) {
    const result = await client.readContract({
      address: QUERY_ADDRESS,
      abi: queryAbi,
      functionName: 'queryBids',
      args: [AUCTION_ADDRESS, []],
    });
    return result as unknown as AuctionState;
  }

  const batches: bigint[][] = [];
  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, count - i) },
      (_, j) => BigInt(i + j),
    );
    batches.push(batch);
  }

  const results = await Promise.all(
    batches.map((ids) =>
      client.readContract({
        address: QUERY_ADDRESS,
        abi: queryAbi,
        functionName: 'queryBids',
        args: [AUCTION_ADDRESS, ids],
      }),
    ),
  );

  const allBids = results.flatMap((r) => (r as unknown as AuctionState).bids);
  const last = results[results.length - 1] as unknown as AuctionState;
  return { ...last, bids: allBids };
}

export async function fetchBlockNumber(): Promise<bigint> {
  return client.getBlockNumber();
}

export async function fetchKasPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd',
    );
    const data = await res.json();
    return data?.kaspa?.usd ?? null;
  } catch {
    return null;
  }
}
