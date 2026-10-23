export const getInitials = (name, fallback = '') => {
  if (!name) return fallback;
  return name
    .trim()
    .split(' ')
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};
