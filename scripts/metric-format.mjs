/** Upward-rounded download buckets, shared by native tags with the same reading. */
export function approximateDownloads(value) {
  if (value === 0) return '0';
  const digits = String(value).length;
  const step = 10n ** BigInt(Math.max(0, digits - (value < 1000 ? 1 : 2)));
  const rounded = (BigInt(value) + step - 1n) / step * step;
  const [scale, suffix] = rounded >= 1_000_000_000n ? [1_000_000_000n, 'b']
    : rounded >= 1_000_000n ? [1_000_000n, 'm']
      : rounded >= 1000n ? [1000n, 'k'] : [1n, ''];
  const fraction = rounded % scale * 10n / scale;
  return `${rounded / scale}${fraction ? '.' + fraction : ''}${suffix}+`;
}
