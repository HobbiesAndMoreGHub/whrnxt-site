// Serves a picture out of Netlify Blobs at /img/<key>.
//
// WHY A FUNCTION AT ALL
//
// Blobs have no public URL — the only way to read one is from a function. That
// sounds like a function call per image view, which would be indefensible for a
// gallery. It is not, because of the header below: Netlify caches this response
// on its CDN and, with `durable`, keeps it in shared storage so other edge nodes
// reuse it instead of invoking this again. So a given image costs one invocation
// on its first request anywhere, and then nothing.
//
// WHY THE CACHE IS A YEAR
//
// Keys are immutable by construction — the upload derives the key from a hash of
// the bytes, so different content is a different key and this URL can never mean
// something else. That is what makes `immutable` honest rather than a gamble.
import { getStore } from '@netlify/blobs';

const TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', avif: 'image/avif', gif: 'image/gif',
};

export default async (req) => {
  const url = new URL(req.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/img\//, ''));

  // Traversal has nothing to escape into here — a blob store is flat, not a
  // filesystem — but a key with a slash in it would silently miss, and refusing
  // it says so instead.
  if (!key || key.includes('/') || key.includes('..') || key.length > 300) {
    return new Response('Bad image key', { status: 400 });
  }

  const ext = (key.split('.').pop() || '').toLowerCase();
  const type = TYPES[ext];
  if (!type) return new Response('Unsupported image type', { status: 400 });

  try {
    const store = getStore({ name: 'place-images', consistency: 'eventual' });
    const blob = await store.get(key, { type: 'arrayBuffer' });
    if (!blob) return new Response('Not found', { status: 404 });

    return new Response(blob, {
      headers: {
        'Content-Type': type,
        // Netlify-CDN-Cache-Control governs Netlify's own cache and is not sent
        // to the browser; Cache-Control governs the browser. Both are wanted,
        // and `durable` is the part that stops this function being invoked again
        // by every other edge node.
        'Netlify-CDN-Cache-Control': 'public, max-age=31536000, immutable, durable',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('img read failed:', err.message);
    return new Response('Could not read that image', { status: 500 });
  }
};

export const config = { path: '/img/:key' };
