export function extractRecords(data: any, type: string): any[] | null {
  if (!data) return null;
  if (Array.isArray(data)) return data.length > 0 ? data : null;

  if (typeof data === 'object') {
    if (type === 'overview') {
      if (Array.isArray(data.overview)) return data.overview;
      if (Array.isArray(data.data)) return data.data;
      if (data.avg_volume_tickets || data.last_week_end || data.history_count) return [data];
    }
    const arr = data.data || data.history || data.predictions || null;
    if (Array.isArray(arr)) return arr;

    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val) && val.length > 0 && (val[0]?.jour || val[0]?.date || val[0]?.site)) {
        return val;
      }
    }
  }
  return null;
}

export function extractPagination(data: any): { nextId: number | null, hasMore: boolean } {
  if (!data || typeof data !== 'object') return { nextId: null, hasMore: false };
  return {
    nextId: typeof data.nextId === 'number' ? data.nextId : null,
    hasMore: data.hasMore === true,
  };
}