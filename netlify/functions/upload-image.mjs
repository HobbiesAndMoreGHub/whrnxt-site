// Receives a picture from the admin and puts it in Netlify Blobs.
//
// WHY THIS EXISTS
//
// Images were going into the git repository: 4.5 GB across 36,999 files, and git
// keeps every version of every binary forever. Adding a few thousand more meant
// hundreds of megabytes of permanent history, paid for on every clone and every
// CI checkout, for files that are never diffed and never merged.
//
// WHO MAY DO IT
//
// The same GitHub accounts that may use the admin. This function is on a
// different origin from the API, so it cannot ask the API who you are; it asks
// GitHub directly with the token the browser already holds, and checks the
// answer against the allowlist. Fails closed: no allowlist, no uploads.
import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const TYPES = {
  'image/jpeg': 'jpg', 'image/png': 'png',
  'image/webp': 'webp', 'image/avif': 'avif',
};
const MAX_BYTES = 8 * 1024 * 1024;   // a photograph, not a raw scan

async function whoIsThis(token) {
  if (!token) return null;
  const r = await fetch('https://api.github.com/user', {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d && d.login ? String(d.login) : null;
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });

  const allow = String(process.env.ADMIN_GITHUB_USERS || '')
    .split(/[,\s]+/).filter(Boolean).map(s => s.toLowerCase());
  if (!allow.length) {
    return Response.json({ error: 'not_configured',
      message: 'ADMIN_GITHUB_USERS is not set on this site, so nobody is allowed to upload.' }, { status: 503 });
  }

  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  const who = await whoIsThis(token);
  if (!who || allow.indexOf(who.toLowerCase()) === -1) {
    return Response.json({ error: 'unauthorized',
      message: who ? who + ' is not on the admin allowlist for this site.' : 'Sign in with GitHub first.' }, { status: 401 });
  }

  const type = String(req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const ext = TYPES[type];
  if (!ext) {
    return Response.json({ error: 'bad_type',
      message: 'Send a JPEG, PNG, WebP or AVIF. That was ' + (type || 'nothing') + '.' }, { status: 415 });
  }

  const bytes = new Uint8Array(await req.arrayBuffer());
  if (!bytes.length) return Response.json({ error: 'empty', message: 'That file was empty.' }, { status: 400 });
  if (bytes.length > MAX_BYTES) {
    return Response.json({ error: 'too_big',
      message: 'That is ' + (bytes.length / 1048576).toFixed(1) + ' MB. The limit is 8 MB — resize it first.' }, { status: 413 });
  }

  // Content-addressed. Uploading the same photograph twice produces the same key
  // rather than a second copy, and a key can never come to mean different bytes
  // — which is what lets the serving function cache for a year and mean it.
  const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 24);
  const key = hash + '.' + ext;

  try {
    const store = getStore({ name: 'place-images', consistency: 'eventual' });
    await store.set(key, bytes, { metadata: { by: who, at: new Date().toISOString(), bytes: bytes.length } });
  } catch (err) {
    console.error('blob write failed:', err.message);
    return Response.json({ error: 'store_failed', message: 'Could not store that image.' }, { status: 502 });
  }

  const origin = new URL(req.url).origin;
  return Response.json({ ok: true, key, url: origin + '/img/' + key, bytes: bytes.length, by: who });
};

export const config = { path: '/api/upload-image' };
