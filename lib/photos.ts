import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "photos.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export interface Photo {
  id: string;
  filename: string;
  title: string;
  description: string;
  location: string;
  takenAt: string;
  uploadedAt: string;
  width: number;
  height: number;
}

export function getPhotos(): Photo[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as Photo[];
}

export function getPhoto(id: string): Photo | undefined {
  return getPhotos().find((p) => p.id === id);
}

export function savePhoto(photo: Photo): void {
  const photos = getPhotos();
  photos.unshift(photo);
  fs.writeFileSync(DATA_FILE, JSON.stringify(photos, null, 2));
}

export function deletePhoto(id: string): void {
  const photos = getPhotos();
  const photo = photos.find((p) => p.id === id);
  if (photo) {
    const filePath = path.join(UPLOADS_DIR, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  const updated = photos.filter((p) => p.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
}

export function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}
