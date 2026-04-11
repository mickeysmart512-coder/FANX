/**
 * FANX Currency & Economy Engine
 * Handles USD/NGN conversion with a 3.5% transaction fee buffer.
 * Base Peg: $1.00 = 100 FANX Coins.
 */

const DEFAULT_RATE = Number(process.env.DEFAULT_USD_TO_NGN_RATE || 1550);
const FEE_BUFFER = Number(process.env.PLATFORM_GATEWAY_FEE || 0.035);

export interface CurrencyConfig {
  rate: number;
  fee: number;
}

/**
 * Calculates the amount in NGN for a given USD value, including gateway fees.
 */
export function usdToNgn(usdAmount: number, config: CurrencyConfig = { rate: DEFAULT_RATE, fee: FEE_BUFFER }): number {
  const baseNgn = usdAmount * config.rate;
  const withFee = baseNgn * (1 + config.fee);
  return Math.ceil(withFee);
}

/**
 * Converts FANX Coins to their USD value for international fans.
 * 100 Coins = $1.00 USD
 */
export function coinsToUsd(coins: number): number {
  return coins / 100;
}

/**
 * Converts FANX Coins to their current NGN value (Estimated Payout).
 */
export function coinsToNgn(coins: number, rate: number = DEFAULT_RATE): number {
  const usdValue = coinsToUsd(coins);
  return usdValue * rate;
}

/**
 * Formats currency values for the UI.
 */
export function formatCurrency(amount: number, currency: 'USD' | 'NGN'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}
