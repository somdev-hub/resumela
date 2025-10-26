// Firestore helper utilities for saving/loading resume data
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// Simple localStorage cache helpers. In browsers we cannot connect to Redis directly;
// if you later add a server-side Redis-backed caching API, set VITE_REDIS_API_URL and
// the optional redis helpers below can be wired to it.
function localCacheKey(type, docId) {
  return `resume_cache_${type}_${docId}`;
}

function cacheSet(type, docId, data) {
  try {
    const payload = { ts: Date.now(), data };
    localStorage.setItem(localCacheKey(type, docId), JSON.stringify(payload));
  } catch {
    void 0;
  }
}

function cacheGet(type, docId, maxAgeMs = 1000 * 60 * 5) {
  try {
    const raw = localStorage.getItem(localCacheKey(type, docId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts) return null;
    if (Date.now() - parsed.ts > maxAgeMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

// NOTE: Redis caching via an HTTP proxy was previously supported here.
// For simplicity we keep a localStorage cache in the browser and read/write
// directly to Firestore; a server-side Redis proxy may be added later if
// cross-client low-latency caching is required.

// Reuse environment variables used in auth.js; fallback to the same defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let dbInstance = null;

export function initFirestore() {
  if (!dbInstance) {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    dbInstance = getFirestore();
  }
  return dbInstance;
}

// Save resume content (personal data + sections) into `resume_content` collection.
// If docId is provided, perform setDoc to that ID; otherwise create a new doc and return its id.
export async function saveResumeContent(docId, content) {
  const db = initFirestore();
  if (docId) {
    await setDoc(doc(db, "resume_content", docId), {
      ...content,
      updatedAt: serverTimestamp(),
    });
    // update local cache and optional redis
    try {
      cacheSet("content", docId, content);
    } catch {
      void 0;
    }
    return docId;
  }
  const ref = await addDoc(collection(db, "resume_content"), {
    ...content,
    createdAt: serverTimestamp(),
  });
  try {
    cacheSet("content", ref.id, content);
  } catch {
    void 0;
  }
  return ref.id;
}

// Save resume layout (layoutConfig, spacingConfig, personalConfig, selectedFont, sectionOrder)
// into `resume_layout` collection. This mirrors structure of content and can be tied by using
// the same document id (docId) if desired.
export async function saveResumeLayout(docId, layout) {
  const db = initFirestore();
  if (docId) {
    await setDoc(doc(db, "resume_layout", docId), {
      ...layout,
      updatedAt: serverTimestamp(),
    });
    try {
      cacheSet("layout", docId, layout);
    } catch {
      void 0;
    }
    return docId;
  }
  const ref = await addDoc(collection(db, "resume_layout"), {
    ...layout,
    createdAt: serverTimestamp(),
  });
  try {
    cacheSet("layout", ref.id, layout);
  } catch {
    void 0;
  }
  return ref.id;
}

export async function getResumeContent(docId) {
  const db = initFirestore();
  // try local cache first (5 minute freshness)
  const cached = cacheGet("content", docId);
  if (cached) return cached;

  // try optional redis proxy
  // no remote cache configured; fall back to Firestore

  const snap = await getDoc(doc(db, "resume_content", docId));
  const data = snap.exists() ? snap.data() : null;
  if (data) cacheSet("content", docId, data);
  return data;
}

export async function getResumeLayout(docId) {
  const db = initFirestore();
  const cached = cacheGet("layout", docId);
  if (cached) return cached;

  // no remote cache configured; fall back to Firestore

  const snap = await getDoc(doc(db, "resume_layout", docId));
  const data = snap.exists() ? snap.data() : null;
  if (data) cacheSet("layout", docId, data);
  return data;
}

export default {
  initFirestore,
  saveResumeContent,
  saveResumeLayout,
  getResumeContent,
  getResumeLayout,
};
