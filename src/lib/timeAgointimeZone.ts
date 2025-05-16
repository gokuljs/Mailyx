export function getTimeAgoInLocalTimezone(
  utcTimeString: string | Date,
  name: string,
) {
  const date =
    typeof utcTimeString === "string"
      ? new Date(utcTimeString.replace(" ", "T") + "Z")
      : utcTimeString;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30); // Approximate
  const diffYears = Math.floor(diffDays / 365); // Approximate

  // More concise formatting commonly used in modern UIs
  if (diffSeconds < 5) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}
