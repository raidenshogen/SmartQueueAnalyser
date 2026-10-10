import { writeJsonFile, readJsonFile, FILE_PATHS } from "../utils/fileStore";
import { extractRecords, extractPagination } from "../utils/dataExtractor";

export async function handleDataRequest(type: 'overview' | 'history' | 'prediction', body: any): Promise<any> {
  const payload = body.payload || {};
  const isSync = payload.sync === true;
  const lastId = Number(payload.lastId || 0);
  const n8nUrl = body.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/api/data";

  // ============================================================
  // OVERVIEW
  // ============================================================
  if (type === 'overview') {
    if (isSync) {
      try {
        const response = await fetch(n8nUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'overview', payload: {} })
        });
        if (!response.ok) return { success: false, error: `n8n HTTP ${response.status}` };
        
        const data = await response.json();
        const records = extractRecords(data, 'overview');
        if (!records || records.length === 0) return { success: false, error: 'No overview data from workflow', raw: data };
        
        const overviewObj = records[0];
        writeJsonFile('overview', { overview: overviewObj, syncedAt: new Date().toISOString(), source: 'n8n' });

        return { success: true, source: 'n8n', overview: overviewObj, syncedAt: new Date().toISOString(), message: 'Overview synced successfully' };
      } catch (e: any) { return { success: false, error: e.message }; }
    } else {
      const cached = readJsonFile('overview');
      if (!cached) return { success: false, error: 'No cached overview — please sync first', expectedPath: FILE_PATHS.overview };
      
      const overviewData = (cached.overview && typeof cached.overview === 'object') ? cached.overview : cached;
      if (!overviewData || typeof overviewData !== 'object') return { success: false, error: 'Cached overview is malformed', cached };

      return { success: true, source: 'cache', overview: overviewData, syncedAt: cached.syncedAt || 'unknown', message: 'Overview loaded from cache' };
    }
  }

  // ============================================================
  // HISTORY & PREDICTION
  // ============================================================
  if (type === 'history' || type === 'prediction') {
    if (isSync && lastId === 0) {
      try {
        const allRecords: any[] = [];
        let currentLastId = 0;
        let totalPages = 0;
        const MAX_PAGES = 100;

        while (totalPages < MAX_PAGES) {
          const response = await fetch(n8nUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, payload: { period: 'quarter', lastId: currentLastId } })
          });
          if (!response.ok) break;
          
          const data = await response.json();
          const records = extractRecords(data, type);
          const { nextId, hasMore } = extractPagination(data);

          if (records && records.length > 0) {
            allRecords.push(...records);
            totalPages++;
          }
          if (hasMore && nextId !== null) currentLastId = nextId;
          else break;
          if (!records || records.length === 0) break;
        }

        writeJsonFile(type, { [type]: allRecords, totalRecords: allRecords.length, pages: totalPages, syncedAt: new Date().toISOString(), source: 'n8n' });

        return { success: true, source: 'n8n', [type]: allRecords, totalRecords: allRecords.length, pages: totalPages, syncedAt: new Date().toISOString(), message: `Synced ${allRecords.length} ${type} records from ${totalPages} pages` };
      } catch (e: any) { return { success: false, error: e.message }; }
    } else {
      const cached = readJsonFile(type);
      if (!cached) return { success: false, error: `No cached ${type} — please sync first`, expectedPath: FILE_PATHS[type] };

      let allRows: any[];
      if (Array.isArray(cached)) allRows = cached;
      else if (Array.isArray(cached[type])) allRows = cached[type];
      else if (Array.isArray(cached.data)) allRows = cached.data;
      else return { success: false, error: `Cached ${type} is not an array`, cached };

      const remaining = lastId > 0 ? allRows.filter(r => r.id > lastId) : allRows;
      const nextId = remaining.length > 0 ? remaining[remaining.length - 1].id : null;

      return { success: true, source: 'cache', [type]: remaining, totalRecords: cached.totalRecords || allRows.length, nextId, hasMore: false, syncedAt: cached.syncedAt || 'unknown', message: `Loaded ${remaining.length} ${type} records from cache` };
    }
  }

  return { success: false, error: `Unknown data type: ${type}` };
}