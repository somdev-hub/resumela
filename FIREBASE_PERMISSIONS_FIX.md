# Firebase Permissions Error Fix

## Problem
Getting error: `FirebaseError: Missing or insufficient permissions` when accessing documents.

This error occurs when:
1. User is not authenticated (logged in)
2. Firestore security rules deny access to the documents
3. The authenticated user doesn't have permission to access the data

## Root Cause Analysis

From code review in `Home.jsx`:
- The app checks if `user` is authenticated before fetching documents
- If `user` is `null`, documents won't be fetched (correct behavior)
- But if the user IS authenticated but security rules deny access, the error appears

## Solutions

### Option 1: Check Your Firestore Security Rules (RECOMMENDED for Production)

The security rules define WHO can access WHAT data. Currently, your rules likely require the user to be authenticated.

**Go to Firebase Console → Firestore Database → Rules**

For **authenticated users only** accessing their own documents:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write resume_content
    match /resume_content/{docId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write resume_layout
    match /resume_layout/{docId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write coverletter_content
    match /coverletter_content/{docId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write coverletter_layout
    match /coverletter_layout/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For **development/testing** (allow anyone - NOT for production):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Option 2: Verify User Authentication

Make sure users can actually log in. Check:

1. **Is Firebase Authentication enabled?**
   - Go to Firebase Console → Authentication
   - Enable at least one sign-in method (Email/Password, Google, etc.)

2. **Are users actually signing in?**
   - Check the Home page - does it show "Welcome back, Guest!" or an actual name?
   - Guest = user is NOT authenticated

3. **Check if auth is working:**
   - Open browser DevTools → Console
   - Look for "Failed to get auth user" or similar errors

### Option 3: Add Better Error Handling

The current code silently fails when permissions are denied. We should show the user what's happening.

**Recommended improvements to Home.jsx:**

```jsx
// In the fetchResumes function catch block:
} catch (err) {
  console.error("Failed to load documents:", err);
  
  // Check the specific error
  if (err.code === 'permission-denied') {
    showError("Access denied. Make sure you're signed in and have permission to view these documents.");
  } else if (err.code === 'unauthenticated') {
    showError("You must be signed in to view your documents.");
  } else {
    showError("Failed to load documents: " + err.message);
  }
}
```

### Option 4: Add ownerUid to Documents (for multi-user support)

To ensure users can only see their own documents:

1. **Update save functions in `firestore.js`:**
   ```javascript
   export async function saveResumeContent(docId, content) {
     const db = initFirestore();
     const { getAuth } = await import("firebase/auth");
     const auth = getAuth();
     const userUid = auth.currentUser?.uid;
     
     if (!userUid) {
       throw new Error("User must be authenticated to save documents");
     }
     
     if (docId) {
       const docRef = doc(db, "resume_content", docId);
       const docSnap = await getDoc(docRef);
       const isNew = !docSnap.exists();
       
       await setDoc(docRef, {
         ...content,
         ownerUid: userUid,  // Add this line
         ...(isNew ? { createdAt: serverTimestamp() } : {}),
         updatedAt: serverTimestamp(),
       });
       // ... rest of function
     }
   }
   ```

2. **Update Firestore Rules:**
   ```javascript
   match /resume_content/{docId} {
     // Only owner can read/write
     allow read, write: if request.auth != null && 
                           resource.data.ownerUid == request.auth.uid;
     // Only authenticated user can create
     allow create: if request.auth != null && 
                      request.resource.data.ownerUid == request.auth.uid;
   }
   ```

## Troubleshooting Checklist

- [ ] Is Firebase initialized correctly? (Check VITE_FIREBASE_* env vars)
- [ ] Is Authentication enabled in Firebase Console?
- [ ] Are users actually signing in? (Check if userName shows "Guest" or actual name)
- [ ] Are Firestore security rules set correctly?
- [ ] Can you write documents? (Are save operations working?)
- [ ] Check browser console for detailed error messages
- [ ] Check Firebase Console → Firestore → Indexes (ensure all needed indexes exist)

## Quick Diagnostics

Add this to Home.jsx temporarily:
```jsx
useEffect(() => {
  console.log("Auth Status:", { user: user?.uid, email: user?.email, authLoading });
}, [user, authLoading]);
```

If this logs `user: undefined` or `user: null`, the user is not authenticated.

## Next Steps

1. **Most likely issue:** User is not authenticated → implement sign-in flow
2. **If user IS authenticated:** Update Firestore security rules to allow access
3. **For production:** Add `ownerUid` tracking to ensure data isolation between users
