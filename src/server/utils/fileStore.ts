import fs from "fs";
import path from "path";

function resolveDataDir(): string {
  const candidates = [
    path.join(process.cwd(), "src", "server"),
    path.join(process.cwd(), "server"),
    path.join(process.cwd(), "data"),
    path.join(process.cwd(), "saved_data"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  const defaultDir = path.join(process.cwd(), "src", "server");
  fs.mkdirSync(defaultDir, { recursive: true });
  return defaultDir;
}

export const DATA_DIR = resolveDataDir();

export const FILE_PATHS = {
  overview:   path.join(DATA_DIR, "saved_data_overview.json"),
  history:    path.join(DATA_DIR, "saved_data_history.json"),
  prediction: path.join(DATA_DIR, "saved_data_prediction.json"),
};

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function writeJsonFile(type: 'overview' | 'history' | 'prediction', data: any): void {
  const filePath = FILE_PATHS[type];
  try {
    ensureDir(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e: any) {
    console.error(`[API] ❌ Failed to save ${type} to ${filePath}:`, e.message);
  }
}

export function readJsonFile(type: 'overview' | 'history' | 'prediction'): any | null {
  const filePath = FILE_PATHS[type];
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e: any) {
    console.error(`[API] ❌ Failed to read ${type} from ${filePath}:`, e.message);
    return null;
  }
}