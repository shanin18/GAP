import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types';

export type UploadCollection = 'media' | 'documents';

function credentials() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) throw new Error('Cloudinary credentials are incomplete.');
  return { cloud_name, api_key, api_secret, secure: true };
}

// IDs depend only on the collection and Payload filename. No new DB fields required.
export function cloudinaryAsset(collection: UploadCollection, filename: string) {
  const extension = extname(filename).slice(1).toLowerCase();
  if (!filename || /[\\/]/.test(filename) || !/^(png|jpe?g|webp|avif|gif|pdf)$/.test(extension)) {
    throw new Error('Unsupported upload filename.');
  }
  const hash = createHash('sha256').update(filename).digest('hex');
  const privateFile = collection === 'documents';
  return {
    public_id: `gap/${collection}/${hash}${privateFile ? `.${extension}` : ''}`,
    resource_type: privateFile ? 'raw' as const : 'image' as const,
    type: privateFile ? 'authenticated' as const : 'upload' as const,
    extension,
  };
}

export function publicMediaURL(filename: string) {
  const asset = cloudinaryAsset('media', filename);
  return cloudinary.url(asset.public_id, {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    secure: true, resource_type: asset.resource_type, type: asset.type,
    format: asset.extension,
  });
}

export async function uploadCloudinaryFile(collection: UploadCollection, filename: string, buffer: Buffer) {
  const { public_id, resource_type, type } = cloudinaryAsset(collection, filename);
  const { cloud_name, api_key, api_secret } = credentials();
  const params = { public_id, type, overwrite: 'true', invalidate: 'true', timestamp: Math.floor(Date.now() / 1000).toString() };
  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.set(key, value);
  form.set('api_key', api_key);
  form.set('signature', cloudinary.utils.api_sign_request(params, api_secret));
  form.set('file', new Blob([new Uint8Array(buffer)]), filename);
  // Known-length multipart requests also work through proxies that reject chunked uploads.
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/${resource_type}/upload`, {
    method: 'POST', body: form, signal: AbortSignal.timeout(60_000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.public_id) {
    let reason = String(result?.error?.message ?? 'Upload endpoint rejected the request');
    for (const value of [cloud_name, api_key, api_secret]) reason = reason.replaceAll(value, '[redacted]');
    throw new Error(`Cloudinary upload failed (${response.status}): ${reason.slice(0, 300)}`);
  }
}

export const cloudinaryAdapter: Adapter = ({ collection }) => {
  if (collection.slug !== 'media' && collection.slug !== 'documents') throw new Error('Unsupported Cloudinary collection.');
  const slug = collection.slug;
  return {
    name: 'cloudinary',
    handleUpload: async ({ file }) => { await uploadCloudinaryFile(slug, file.filename, file.buffer); },
    handleDelete: async ({ filename }) => {
      const { public_id, extension: _extension, ...asset } = cloudinaryAsset(slug, filename);
      await cloudinary.uploader.destroy(public_id, { ...credentials(), ...asset, invalidate: true });
    },
    // Payload checks collection read access BEFORE invoking this handler.
    // Documents never redirect to a reusable signed Cloudinary URL.
    staticHandler: async (req, { doc, params }) => {
      let fileDoc = doc as { filename?: string | null; mimeType?: string | null } | undefined;
      const headers = new Headers({
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      });
      if (slug === 'documents' && !req.user) {
        return new Response(null, { status: 404, headers });
      }
      try {
        // Unconditional public/admin read access does not return a doc from Payload.
        if (!fileDoc) {
          const result = await req.payload.find({
            collection: slug, req, overrideAccess: false, limit: 1, depth: 0,
            where: { filename: { equals: params.filename } },
          });
          fileDoc = result.docs[0];
        }
        if (!fileDoc || fileDoc.filename !== params.filename) return new Response(null, { status: 404, headers });
        const { public_id, resource_type, type } = cloudinaryAsset(slug, params.filename);
        const url = slug === 'media' ? publicMediaURL(params.filename) : cloudinary.url(public_id, {
          ...credentials(), resource_type, type, sign_url: true,
        });
        const upstream = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(30_000) });
        if (!upstream.ok) {
          await upstream.body?.cancel();
          return new Response(null, { status: upstream.status === 404 ? 404 : 502, headers });
        }
        headers.set('Content-Type', typeof fileDoc.mimeType === 'string' ? fileDoc.mimeType : 'application/octet-stream');
        if (slug === 'documents') headers.set('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(params.filename)}`);
        return new Response(upstream.body, { headers });
      } catch {
        return new Response(null, { status: 502, headers });
      }
    },
  };
};
