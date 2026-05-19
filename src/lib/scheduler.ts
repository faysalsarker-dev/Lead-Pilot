import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';

/**
 * Converts send window string "HH:MM-HH:MM" to UTC datetime for a lead in their timezone
 *
 * Example:
 * - Lead timezone: "America/New_York"
 * - Send window: "09:00-11:00" (9am-11am in lead's local time)
 * - Current UTC: 2024-05-15 20:00:00
 * - Result: 2024-05-16 13:00:00 UTC (next day 9am EST)
 */
export function calculateScheduledAt(
  sendWindow: string, // "09:00-11:00"
  leadTimezone: string,
  baseTime: Date = new Date()
): Date {
  try {
    // Parse send window
    const [startStr, endStr] = sendWindow.split('-');
    const [startHour, startMinute] = startStr.split(':').map(Number);

    if (!leadTimezone || typeof startHour !== 'number' || typeof startMinute !== 'number') {
      // Fallback: use UTC noon
      return new Date(baseTime.getTime() + 12 * 60 * 60 * 1000);
    }

    // Create a date in the lead's timezone at start of send window
    const timeString = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`;
    const localDateString = format(baseTime, 'yyyy-MM-dd', { timeZone: leadTimezone });
    const localDateTime = `${localDateString}T${timeString}`;

    // Parse as date in lead's timezone
    const scheduledLocal = new Date(localDateTime);
    const scheduledUTC = fromZonedTime(scheduledLocal, leadTimezone);

    // If scheduled time is in the past, add 1 day
    if (scheduledUTC <= baseTime) {
      scheduledUTC.setDate(scheduledUTC.getDate() + 1);
    }

    return scheduledUTC;
  } catch (error) {
    // Fallback: schedule for tomorrow at noon UTC
    const tomorrow = new Date(baseTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    return tomorrow;
  }
}

/**
 * Checks if a date/time is within send window for a lead's timezone
 */
export function isWithinSendWindow(
  time: Date,
  sendWindow: string, // "09:00-11:00"
  leadTimezone: string
): boolean {
  try {
    const [startStr, endStr] = sendWindow.split('-');
    const [startHour, startMinute] = startStr.split(':').map(Number);
    const [endHour, endMinute] = endStr.split(':').map(Number);

    // Convert time to lead's timezone
    const zonedTime = toZonedTime(time, leadTimezone);
    const hours = zonedTime.getHours();
    const minutes = zonedTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    return totalMinutes >= startTotal && totalMinutes < endTotal;
  } catch {
    return true; // Default to true if calculation fails
  }
}

/**
 * Adds days to a date accounting for lead's timezone
 */
export function addDaysInTimezone(date: Date, days: number, timezone: string): Date {
  try {
    const zonedDate = toZonedTime(date, timezone);
    zonedDate.setDate(zonedDate.getDate() + days);
    return fromZonedTime(zonedDate, timezone);
  } catch {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
