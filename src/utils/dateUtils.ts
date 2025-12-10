export function formatMatchDate(dateString: string): string {
  const matchDate = new Date(dateString);
  const now = new Date();
  
  // Create date objects for comparison (set to start of day)
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Create match date at start of day for comparison
  const matchDay = new Date(matchDate);
  matchDay.setHours(0, 0, 0, 0);
  
  // Format time part (e.g., "13:00 PM")
  const timeString = matchDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();

  // Check if it's today
  if (matchDay.getTime() === today.getTime()) {
    return `Today ${timeString}`;
  }
  
  // Check if it's tomorrow
  if (matchDay.getTime() === tomorrow.getTime()) {
    return `Tomorrow ${timeString}`;
  }
  
  // Check if it's within the next 7 days
  if (matchDate < nextWeek) {
    const dayName = matchDate.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} ${timeString}`;
  }
  
  // For dates beyond next week, return full date and time
  return matchDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();
}
