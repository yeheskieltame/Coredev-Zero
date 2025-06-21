/**
 * BigInt utility functions for safe timestamp and number conversion
 * Prevents RangeError: The number cannot be converted to a BigInt because it is not an integer
 */

/**
 * Safely converts a timestamp to BigInt (in seconds)
 * @param offsetSeconds - Optional offset in seconds (can be negative for past timestamps)
 * @returns BigInt timestamp in seconds
 */
export function createTimestamp(offsetSeconds: number = 0): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + offsetSeconds)
}

/**
 * Safely converts a number to BigInt, ensuring it's an integer
 * @param value - Number to convert
 * @returns BigInt value
 */
export function safeBigInt(value: number): bigint {
  return BigInt(Math.floor(value))
}

/**
 * Creates a timestamp for N days ago
 * @param days - Number of days in the past
 * @returns BigInt timestamp
 */
export function daysAgo(days: number): bigint {
  return createTimestamp(-days * 24 * 60 * 60)
}

/**
 * Creates a timestamp for N days in the future
 * @param days - Number of days in the future
 * @returns BigInt timestamp
 */
export function daysFromNow(days: number): bigint {
  return createTimestamp(days * 24 * 60 * 60)
}

/**
 * Converts ETH amount string to Wei (BigInt)
 * @param ethAmount - ETH amount as string (e.g., "1.5")
 * @returns BigInt in Wei
 */
export function ethToWei(ethAmount: string): bigint {
  const eth = parseFloat(ethAmount)
  return BigInt(Math.floor(eth * 10**18))
}

/**
 * Converts Wei (BigInt) to ETH string
 * @param weiAmount - Amount in Wei as BigInt
 * @returns ETH amount as string
 */
export function weiToEth(weiAmount: bigint): string {
  return (Number(weiAmount) / 10**18).toFixed(6)
}

/**
 * Formats interest rate from basis points to percentage
 * @param rate - Interest rate in basis points (e.g., 1200 = 12%)
 * @returns Formatted percentage string
 */
export function formatInterestRate(rate: bigint): string {
  return `${(Number(rate) / 100).toFixed(2)}%`
}

/**
 * Formats duration from seconds to human readable string
 * @param durationSeconds - Duration in seconds as BigInt
 * @returns Human readable duration string
 */
export function formatDuration(durationSeconds: bigint): string {
  const days = Number(durationSeconds) / 86400
  if (days >= 365) {
    return `${Math.round(days / 365)} year${days >= 730 ? 's' : ''}`
  } else if (days >= 30) {
    return `${Math.round(days / 30)} month${days >= 60 ? 's' : ''}`
  } else {
    return `${Math.round(days)} day${days >= 2 ? 's' : ''}`
  }
}

/**
 * Creates a random BigInt within a range
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random BigInt
 */
export function randomBigInt(min: number, max: number): bigint {
  const randomValue = Math.floor(Math.random() * (max - min + 1)) + min
  return BigInt(randomValue)
}

/**
 * Safely formats a BigInt timestamp to human readable date
 * @param timestamp - BigInt timestamp in seconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calculate time remaining until a timestamp
 * @param futureTimestamp - BigInt timestamp in seconds
 * @returns Human readable time remaining
 */
export function timeUntil(futureTimestamp: bigint): string {
  const now = Math.floor(Date.now() / 1000)
  const future = Number(futureTimestamp)
  const diffSeconds = future - now
  
  if (diffSeconds <= 0) {
    return 'Expired'
  }
  
  const days = Math.floor(diffSeconds / 86400)
  const hours = Math.floor((diffSeconds % 86400) / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
