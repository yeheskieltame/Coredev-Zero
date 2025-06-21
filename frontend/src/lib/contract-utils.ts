import { toast } from 'react-hot-toast'

export function formatAddress(address: string, length: number = 6): string {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function formatCurrency(
  amount: bigint | string,
  symbol: string = 'USDT',
  decimals: number = 18
): string {
  try {
    let value: number
    if (typeof amount === 'bigint') {
      value = Number(amount) / Math.pow(10, decimals)
    } else {
      value = parseFloat(amount)
    }
    
    return `${value.toFixed(2)} ${symbol}`
  } catch {
    return `0.00 ${symbol}`
  }
}

export function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function calculateAPR(interestRate: bigint, duration: number): number {
  const rate = Number(interestRate) / 100 // Convert from basis points
  return (rate / duration) * 365 // Annualized
}

export function formatPercentage(value: number | bigint): string {
  const num = typeof value === 'bigint' ? Number(value) / 100 : value
  return `${num.toFixed(2)}%`
}

// Notification helpers
export function showToast(type: 'success' | 'error' | 'info' | 'warning', message: string) {
  switch (type) {
    case 'success':
      toast.success(message)
      break
    case 'error':
      toast.error(message)
      break
    case 'info':
      toast(message, { icon: 'ℹ️' })
      break
    case 'warning':
      toast(message, { icon: '⚠️' })
      break
  }
}

export function showSuccess(message: string) {
  toast.success(message)
}

export function showError(message: string) {
  toast.error(message)
}

export function showLoading(message: string) {
  return toast.loading(message)
}

export function updateToast(toastId: string, message: string, type: 'success' | 'error') {
  if (type === 'success') {
    toast.success(message, { id: toastId })
  } else {
    toast.error(message, { id: toastId })
  }
}
