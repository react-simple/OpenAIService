export const formatInteger = (value: number) => {
  let s = value.toString();

  for (let i = s.length - 3; i > 0; i -= 3) {
    s = `${s.substring(0, i)}.${s.substring(i)}`;
  }

  return s;
};

export function formatWithSuffix(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}G`;

  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;

  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;

  return String(n);
}
