/**
 * Format a date as a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  // Get current time
  const now = new Date();

  // Calculate the difference in milliseconds
  const diffMs = now.getTime() - date.getTime();

  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);

  // Less than a minute
  if (diffSec < 60) {
    return "just now";
  }

  // Less than an hour
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins} ${mins === 1 ? "min" : "mins"} ago`;
  }

  // Less than a day
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Less than a week
  if (diffSec < 604800) {
    const days = Math.floor(diffSec / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // If more than a week ago, use local date string
  return date.toLocaleDateString();
}
