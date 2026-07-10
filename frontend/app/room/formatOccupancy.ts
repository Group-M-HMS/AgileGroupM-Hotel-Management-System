export function formatOccupancy(maxOccupancy: number): string {
  const guestWord = maxOccupancy === 1 ? "guest" : "guests";
  return `Sleeps up to ${maxOccupancy} ${guestWord}`;
}
