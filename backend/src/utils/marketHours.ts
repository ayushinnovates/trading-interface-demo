export interface MarketStatus {
  isOpen: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  currentTime: Date;
  marketOpenTime: Date;
  marketCloseTime: Date;
  nextMarketOpen: Date;
}
export function isMarketOpen(): boolean {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  if (day === 0 || day === 6) {
    return false;
  }
  const marketOpenMinutes = 9 * 60 + 15;
  const marketCloseMinutes = 15 * 60 + 30;
  return timeInMinutes >= marketOpenMinutes && timeInMinutes < marketCloseMinutes;
}
export function getMarketStatus(): MarketStatus {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const isWeekend = day === 0 || day === 6;
  const marketOpenMinutes = 9 * 60 + 15;
  const marketCloseMinutes = 15 * 60 + 30;
  const marketOpenTime = new Date(istTime);
  marketOpenTime.setHours(9, 15, 0, 0);
  const marketCloseTime = new Date(istTime);
  marketCloseTime.setHours(15, 30, 0, 0);
  const nextMarketOpen = new Date(istTime);
  if (isWeekend || timeInMinutes >= marketCloseMinutes) {
    const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7;
    nextMarketOpen.setDate(istTime.getDate() + daysUntilMonday);
    nextMarketOpen.setHours(9, 15, 0, 0);
  } else if (timeInMinutes < marketOpenMinutes) {
    nextMarketOpen.setHours(9, 15, 0, 0);
  } else {
    nextMarketOpen.setHours(9, 15, 0, 0);
    nextMarketOpen.setDate(istTime.getDate() + 1);
  }
  const isOpen = !isWeekend && timeInMinutes >= marketOpenMinutes && timeInMinutes < marketCloseMinutes;
  return {
    isOpen,
    isWeekend,
    isHoliday: false,
    currentTime: istTime,
    marketOpenTime,
    marketCloseTime,
    nextMarketOpen,
  };
}
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