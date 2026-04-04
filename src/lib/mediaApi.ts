import { api } from './api';
import { resolveMediaUrl } from './mediaUrl';

export async function uploadMedia(file: File, folder = 'uploads'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  const { data } = await api.post('/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return resolveMediaUrl(data.data.url as string) ?? (data.data.url as string);
}
