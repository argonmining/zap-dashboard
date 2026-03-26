const Q96 = 2n ** 96n;
const WAD = 10n ** 18n;
const PRECISION = 10n ** 12n;

export function fromQ96Price(q96: bigint): number {
  const scaled = q96 * PRECISION / Q96;
  return Number(scaled) / Number(PRECISION);
}

export function fromQ96Amount(q96Amount: bigint): number {
  const wei = q96Amount / Q96;
  return fromWei(wei);
}

export function fromWei(wei: bigint): number {
  const intPart = wei / WAD;
  const fracPart = wei % WAD;
  return Number(intPart) + Number(fracPart) / 1e18;
}

export function fromRawTokens(raw: bigint, decimals = 18): number {
  const d = 10n ** BigInt(decimals);
  const intPart = raw / d;
  const fracPart = raw % d;
  return Number(intPart) + Number(fracPart) / Number(d);
}

export function fmtNum(n: number, decimals = 2): string {
  if (n === 0) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(decimals) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
  if (n >= 1e4) return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
  if (n >= 0.0001) return n.toFixed(6);
  return n.toExponential(4);
}

export function fmtPrice(n: number): string {
  if (n === 0) return '0';
  if (n < 0.0001) return n.toExponential(4);
  if (n < 0.01) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2);
}

export function fmtAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function fmtBlocks(blocks: number): string {
  const secs = Math.abs(blocks);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  return `${Math.floor(secs / 86400)}d ${Math.floor((secs % 86400) / 3600)}h`;
}
