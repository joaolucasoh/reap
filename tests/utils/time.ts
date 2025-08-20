export async function within<T>(p: Promise<T>, ms: number): Promise<T> {
  const t = setTimeout(() => { throw new Error(`Timeout > ${ms}ms`); }, ms);
  try { return await p; } finally { clearTimeout(t); }
}