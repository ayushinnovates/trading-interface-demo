/**
 * Market Hours Utility for Indian Stock Exchanges (NSE/BSE)
 * Market Hours: 9:15 AM - 3:30 PM IST (Monday to Friday)
 */

export interface MarketStatus {
  isOpen: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  currentTime: Date;
  marketOpenTime: Date;
  marketCloseTime: Date;
  nextMarketOpen: Date;
}

/**
 * Check if Indian stock market is currently open
 * Market Hours: 9:15 AM - 3:30 PM IST (Monday to Friday)
 */
export function isMarketOpen(): boolean {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Market is closed on weekends
  if (day === 0 || day === 6) {
    return false;
  }

  // Market hours: 9:15 AM (555 minutes) to 3:30 PM (930 minutes) IST
  const marketOpenMinutes = 9 * 60 + 15; // 9:15 AM
  const marketCloseMinutes = 15 * 60 + 30; // 3:30 PM

  return timeInMinutes >= marketOpenMinutes && timeInMinutes < marketCloseMinutes;
}

/**
 * Get detailed market status
 */
export function getMarketStatus(): MarketStatus {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const isWeekend = day === 0 || day === 6;
  const marketOpenMinutes = 9 * 60 + 15; // 9:15 AM
  const marketCloseMinutes = 15 * 60 + 30; // 3:30 PM

  // Create market open/close times for today
  const marketOpenTime = new Date(istTime);
  marketOpenTime.setHours(9, 15, 0, 0);
  
  const marketCloseTime = new Date(istTime);
  marketCloseTime.setHours(15, 30, 0, 0);

  // Calculate next market open
  const nextMarketOpen = new Date(istTime);
  if (isWeekend || timeInMinutes >= marketCloseMinutes) {
    // If market is closed, find next Monday at 9:15 AM
    const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7;
    nextMarketOpen.setDate(istTime.getDate() + daysUntilMonday);
    nextMarketOpen.setHours(9, 15, 0, 0);
  } else if (timeInMinutes < marketOpenMinutes) {
    // Market opens today
    nextMarketOpen.setHours(9, 15, 0, 0);
  } else {
    // Market is open
    nextMarketOpen.setHours(9, 15, 0, 0);
    nextMarketOpen.setDate(istTime.getDate() + 1);
  }

  const isOpen = !isWeekend && timeInMinutes >= marketOpenMinutes && timeInMinutes < marketCloseMinutes;

  return {
    isOpen,
    isWeekend,
    isHoliday: false, // Could be enhanced with holiday calendar
    currentTime: istTime,
    marketOpenTime,
    marketCloseTime,
    nextMarketOpen,
  };
}

/**
 * Get formatted market status message
 */
export function getMarketStatusMessage(): string {
  const status = getMarketStatus();
  
  if (status.isOpen) {
    return 'Market is OPEN';
  } else if (status.isWeekend) {
    return 'Market is CLOSED (Weekend)';
  } else {
    const now = status.currentTime;
    const openTime = status.marketOpenTime;
    const closeTime = status.marketCloseTime;
    
    if (now < openTime) {
      return `Market opens at ${openTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`;
    } else {
      return `Market closed at ${closeTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`;
    }
  }
}

