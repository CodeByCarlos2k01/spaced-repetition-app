let cameFromReading = false;

export function markCameFromReading() {
  cameFromReading = true;
}

export function consumeCameFromReading() {
  const value = cameFromReading;
  cameFromReading = false;
  return value;
}