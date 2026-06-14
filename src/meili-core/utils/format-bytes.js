/**
 * @param {number | undefined | null} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes) || bytes < 0) {
    return "—";
  }
  if (bytes === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const v = bytes / 1024 ** i;
  return `${v >= 100 ? v.toFixed(0) : v.toFixed(v >= 10 ? 1 : 2)} ${units[i]}`;
}
