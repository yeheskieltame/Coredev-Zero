'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, TrendingUp, DollarSign } from 'lucide-react'
import { showToast } from '@/lib/contract-utils'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Mock notifications data - replace with real data source
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Loan Approved!',
    message: 'Your loan request of 5 ETH has been approved by the lender.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    action: {
      label: 'View Details',
      onClick: () => console.log('View loan details')
    }
  },
  {
    id: '2',
    type: 'info',
    title: 'New Market Available',
    message: 'A new lending market for React developers is now available.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    action: {
      label: 'Explore',
      onClick: () => console.log('Explore market')
    }
  },
  {
    id: '3',
    type: 'warning',
    title: 'Payment Due Soon',
    message: 'Your loan payment of 1.2 ETH is due in 2 days.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    action: {
      label: 'Pay Now',
      onClick: () => console.log('Make payment')
    }
  },
  {
    id: '4',
    type: 'success',
    title: 'Staking Reward',
    message: 'You earned 0.05 ETH in staking rewards this week.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    read: true
  },
  {
    id: '5',
    type: 'error',
    title: 'Transaction Failed',
    message: 'Your recent transaction failed due to insufficient gas.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true
  }
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.read
  )

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    showToast('success', 'All notifications marked as read')
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    showToast('info', 'Notification deleted')
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Mock real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving a new notification
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          title: 'Real-time Update',
          message: 'This is a simulated real-time notification.',
          timestamp: new Date(),
          read: false
        }
        
        setNotifications(prev => [newNotification, ...prev])
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          })
        }
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-gray-900/95 backdrop-blur-lg rounded-lg border border-white/20 shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === 'all'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === 'unread'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/10 last:border-b-0 ${
                    !notification.read ? 'bg-white/5' : ''
                  } hover:bg-white/10 transition-colors duration-200`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            notification.read ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 w-2 h-2 bg-cyan-400 rounded-full inline-block"></span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-cyan-400"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {notification.action && (
                        <button
                          onClick={() => {
                            notification.action?.onClick()
                            markAsRead(notification.id)
                          }}
                          className="mt-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors duration-200"
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => {
                setIsOpen(false)
                // Navigate to full notifications page
                console.log('Navigate to notifications page')
              }}
              className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
