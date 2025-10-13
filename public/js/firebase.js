import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase, ref, get, set, push, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// SECURITY: Simple sanitization function to prevent XSS attacks
function sanitize(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&#039;');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // Initialize Auth

// --- Authentication Functions ---

window.isUserLoggedIn = () => {
    return auth.currentUser !== null;
}

// Global function to trigger Google Sign-In
window.signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider).catch((error) => { 
        console.error("Sign-in failed:", error);
    });
}

// Listener function that takes a callback (e.g., to update your UI)
window.setupAuthListener = (callback) => {
    onAuthStateChanged(auth, callback);
}

// This block runs every time the page loads. If it's returning from a Google redirect, 
// this function catches the sign-in result.
function handleRedirectResult() {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
            console.log("Successfully signed in via redirect!", result.user);
            // The onAuthStateChanged listener you already set up (window.setupAuthListener)
            // will automatically handle updating the UI and showing the comment form.
        }
      }).catch((error) => {
        // Handle any errors that occurred during the redirect sign-in process
        console.error("Redirect sign-in error:", error);
      });
}

// Call the handler immediately when the script runs
handleRedirectResult();

// --- Like Functions (CRITICAL FIX: Using runTransaction) ---

function getPostLikes(postID, callback) {
    const postLikesRef = ref(db, 'likes/' + postID + '/count'); // Check the 'count' path
    get(postLikesRef).then((snapshot) => {
        const count = snapshot.val() || 0;
        callback(count);
    });
}

function incrementPostLikes(postID) {
    // FIX: Using runTransaction to enforce the atomic +1 increment required by security rules
    const postLikesRef = ref(db, 'likes/' + postID + '/count');

    return runTransaction(postLikesRef, (currentCount) => {
        if (currentCount === null) {
            return 1; // Start at 1 if node doesn't exist
        }
        return currentCount + 1; // Atomic increment
    }).then((result) => {
        if (!result.committed) {
            console.warn("Transaction not committed (might be concurrency issue).");
            return null;
        }
        return result.snapshot.val();
    }).catch(error => {
        console.error("Like increment failed:", error);
        return null;
    });
}

/*
 * Handles the like click event and updates the UI.
 * This is called by the event listener.
 */
function handleLikeClick(postID) {
    // 1. Call the Firebase function to increment the like count
    incrementPostLikes(postID).then(newCount => {
        if (newCount !== null) {
            // 2. Update the count display in the UI
            const countElement = document.getElementById(`like-count-${postID}`);
            if (countElement) {
                countElement.textContent = newCount;
            }
        }
    }).catch(error => {
        console.error("Failed to process like:", error);
    });
}

/**
 * Attaches the handleLikeClick function to all like buttons on the page.
 */
function setupLikeButtonListeners() {
    // Finds all buttons whose ID starts with 'like-button-' (e.g., 'like-button-cef4...')
    document.querySelectorAll('[id^="like-button-"]').forEach(button => {
        // Read the unique post ID from the button's ID
        const postID = button.id.replace('like-button-', '');
       
        getPostLikes(postID, (count) => {
            const countElement = document.getElementById(`like-count-${postID}`);
            if (countElement) {
                countElement.textContent = count;
            }
        });

        // Check if the listener has already been added (prevents duplicates in dev mode)
        if (button.dataset.listenerAdded) return;

        // Attach the event listener for a click
        button.addEventListener('click', () => {
            handleLikeClick(postID);
        });

        // Mark the button so we don't attach the listener again
        button.dataset.listenerAdded = 'true';
    });
}

// --- Comment Functions (CRITICAL FIX: Adding Auth Check and Real-time Listener) ---

function saveComment(postID, username, comment, parentID = null) {
    if (!auth.currentUser) {
        console.error("Authentication required to save comment.");
        // FIX: The calling code should handle prompting the user to sign in
        return Promise.reject(new Error("User not authenticated")); 
    }
    
    // Use the authenticated user's display name and UID for security/integrity
    const uid = auth.currentUser.uid;
    const name = auth.currentUser.displayName || sanitize(username); 

    const commentData = {
        username: name,
        comment: sanitize(comment),
        timestamp: new Date().toISOString(),
        parentID: parentID || null,
        uid: uid // Storing UID is good for validation
    };
    
    const newCommentRef = push(ref(db, `comments/${postID}`));
    return set(newCommentRef, commentData);
}

// FIX: Use onValue for real-time updates instead of get (one-time read)
function setupCommentListener(postID, onCommentsUpdated) {
    const commentsRef = ref(db, `comments/${postID}`);
    
    // onValue creates a persistent listener that triggers whenever data changes
    return onValue(commentsRef, (snapshot) => {
        const comments = [];
        snapshot.forEach((childSnapshot) => {
            const rawData = childSnapshot.val();
            comments.push({ 
                id: childSnapshot.key, 
                username: sanitize(rawData.username),
                comment: sanitize(rawData.comment),
                timestamp: rawData.timestamp,
                parentID: rawData.parentID,
                uid: rawData.uid
            });import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase, ref, get, set, push, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// SECURITY: Simple sanitization function to prevent XSS attacks
function sanitize(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&#039;');
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDrp8SKvAvZdpvbsYARzIOMH9HPQypCfLY",
    authDomain: "matthew-greenwood.com",
    projectId: "comments-likes",
    storageBucket: "comments-likes.firebasestorage.app",
    messagingSenderId: "385214375813",
    appId: "1:385214375813:web:19c081628c1f676c3f86ec",
    measurementId: "G-Z830D7DHG2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // Initialize Auth

// --- Authentication Functions ---

window.isUserLoggedIn = () => {
    return auth.currentUser !== null;
}

// Global function to trigger Google Sign-In
window.signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider).catch((error) => { 
        console.error("Sign-in failed:", error);
    });
}

// Listener function that takes a callback (e.g., to update your UI)
window.setupAuthListener = (callback) => {
    onAuthStateChanged(auth, callback);
}

// This block runs every time the page loads. If it's returning from a Google redirect, 
// this function catches the sign-in result.
function handleRedirectResult() {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
            console.log("Successfully signed in via redirect!", result.user);
            // The onAuthStateChanged listener you already set up (window.setupAuthListener)
            // will automatically handle updating the UI and showing the comment form.
        }
      }).catch((error) => {
        // Handle any errors that occurred during the redirect sign-in process
        console.error("Redirect sign-in error:", error);
      });
}

// Call the handler immediately when the script runs
handleRedirectResult();

// --- Like Functions (CRITICAL FIX: Using runTransaction) ---

function getPostLikes(postID, callback) {
    const postLikesRef = ref(db, 'likes/' + postID + '/count'); // Check the 'count' path
    get(postLikesRef).then((snapshot) => {
        const count = snapshot.val() || 0;
        callback(count);
    });
}

function incrementPostLikes(postID) {
    // FIX: Using runTransaction to enforce the atomic +1 increment required by security rules
    const postLikesRef = ref(db, 'likes/' + postID + '/count');

    return runTransaction(postLikesRef, (currentCount) => {
        if (currentCount === null) {
            return 1; // Start at 1 if node doesn't exist
        }
        return currentCount + 1; // Atomic increment
    }).then((result) => {
        if (!result.committed) {
            console.warn("Transaction not committed (might be concurrency issue).");
            return null;
        }
        return result.snapshot.val();
    }).catch(error => {
        console.error("Like increment failed:", error);
        return null;
    });
}

/*
 * Handles the like click event and updates the UI.
 * This is called by the event listener.
 */
function handleLikeClick(postID) {
    // 1. Call the Firebase function to increment the like count
    incrementPostLikes(postID).then(newCount => {
        if (newCount !== null) {
            // 2. Update the count display in the UI
            const countElement = document.getElementById(`like-count-${postID}`);
            if (countElement) {
                countElement.textContent = newCount;
            }
        }
    }).catch(error => {
        console.error("Failed to process like:", error);
    });
}

/**
 * Attaches the handleLikeClick function to all like buttons on the page.
 */
function setupLikeButtonListeners() {
    // Finds all buttons whose ID starts with 'like-button-' (e.g., 'like-button-cef4...')
    document.querySelectorAll('[id^="like-button-"]').forEach(button => {
        // Read the unique post ID from the button's ID
        const postID = button.id.replace('like-button-', '');
       
        getPostLikes(postID, (count) => {
            const countElement = document.getElementById(`like-count-${postID}`);
            if (countElement) {
                countElement.textContent = count;
            }
        });

        // Check if the listener has already been added (prevents duplicates in dev mode)
        if (button.dataset.listenerAdded) return;

        // Attach the event listener for a click
        button.addEventListener('click', () => {
            handleLikeClick(postID);
        });

        // Mark the button so we don't attach the listener again
        button.dataset.listenerAdded = 'true';
    });
}

// --- Comment Functions (CRITICAL FIX: Adding Auth Check and Real-time Listener) ---

function saveComment(postID, username, comment, parentID = null) {
    if (!auth.currentUser) {
        console.error("Authentication required to save comment.");
        // FIX: The calling code should handle prompting the user to sign in
        return Promise.reject(new Error("User not authenticated")); 
    }
    
    // Use the authenticated user's display name and UID for security/integrity
    const uid = auth.currentUser.uid;
    const name = auth.currentUser.displayName || sanitize(username); 

    const commentData = {
        username: name,
        comment: sanitize(comment),
        timestamp: new Date().toISOString(),
        parentID: parentID || null,
        uid: uid // Storing UID is good for validation
    };
    
    const newCommentRef = push(ref(db, `comments/${postID}`));
    return set(newCommentRef, commentData);
}

// FIX: Use onValue for real-time updates instead of get (one-time read)
function setupCommentListener(postID, onCommentsUpdated) {
    const commentsRef = ref(db, `comments/${postID}`);
    
    // onValue creates a persistent listener that triggers whenever data changes
    return onValue(commentsRef, (snapshot) => {
        const comments = [];
        snapshot.forEach((childSnapshot) => {
            const rawData = childSnapshot.val();
            comments.push({ 
                id: childSnapshot.key, 
                username: sanitize(rawData.username),
                comment: sanitize(rawData.comment),
                timestamp: rawData.timestamp,
                parentID: rawData.parentID,
                uid: rawData.uid
            });
        });
        onCommentsUpdated(comments);
    });
}

// --- Authentication UI Setup ---

function updateCommentUI(postID, user) {
    const authContainer = document.getElementById(`auth-ui-${postID}`);
    const formElement = document.getElementById(`comment-form-${postID}`);
    const signInPrompt = document.createElement('p');

    // Clear existing content
    authContainer.innerHTML = '';

    if (user) {
        // User is logged in: Show the form
        signInPrompt.innerHTML = `Logged in as <strong>${user.displayName || 'Anonymous'}</strong>.`;
        authContainer.appendChild(signInPrompt);
        if (formElement) formElement.style.display = 'block';
    } else {
        // User is NOT logged in: Show the sign-in button
        signInPrompt.innerHTML = 'You must sign in to leave a comment: ';
        const signInButton = document.createElement('button');
        signInButton.textContent = 'Sign In with Google';
        
        // CRITICAL: Attach the global signIn function
        signInButton.addEventListener('click', window.signIn); 

        authContainer.appendChild(signInPrompt);
        authContainer.appendChild(signInButton);
        if (formElement) formElement.style.display = 'none'; // Hide the form
    }
}


// --- Execute Authentication Listener ---

// Run this at the very bottom of firebase.js, after all setup functions
document.querySelectorAll('[id^="comments-section"]').forEach(section => {
    const postID = section.querySelector('form').id.replace('comment-form-', '');
    // This listener updates the UI whenever the sign-in status changes
    window.setupAuthListener((user) => {
        updateCommentUI(postID, user);
    });
});

// --- Export Functions ---
// Export all relevant functions to the global scope for use in your HTML/other JS files
window.getPostLikes = getPostLikes;
window.incrementPostLikes = incrementPostLikes;
window.saveComment = saveComment;
window.setupCommentListener = setupCommentListener; // Changed loadComments to listener
window.sanitize = sanitize;
setupLikeButtonListeners();
        });
        onCommentsUpdated(comments);
    });
}

// --- Authentication UI Setup ---

function updateCommentUI(postID, user) {
    const authContainer = document.getElementById(`auth-ui-${postID}`);
    const formElement = document.getElementById(`comment-form-${postID}`);
    const signInPrompt = document.createElement('p');

    // Clear existing content
    authContainer.innerHTML = '';

    if (user) {
        // User is logged in: Show the form
        signInPrompt.innerHTML = `Logged in as <strong>${user.displayName || 'Anonymous'}</strong>.`;
        authContainer.appendChild(signInPrompt);
        if (formElement) formElement.style.display = 'block';
    } else {
        // User is NOT logged in: Show the sign-in button
        signInPrompt.innerHTML = 'You must sign in to leave a comment: ';
        const signInButton = document.createElement('button');
        signInButton.textContent = 'Sign In with Google';
        
        // CRITICAL: Attach the global signIn function
        signInButton.addEventListener('click', window.signIn); 

        authContainer.appendChild(signInPrompt);
        authContainer.appendChild(signInButton);
        if (formElement) formElement.style.display = 'none'; // Hide the form
    }
}


// --- Execute Authentication Listener ---

// Run this at the very bottom of firebase.js, after all setup functions
document.querySelectorAll('[id^="comments-section"]').forEach(section => {
    const postID = section.querySelector('form').id.replace('comment-form-', '');
    // This listener updates the UI whenever the sign-in status changes
    window.setupAuthListener((user) => {
        updateCommentUI(postID, user);
    });
});

// --- Export Functions ---
// Export all relevant functions to the global scope for use in your HTML/other JS files
window.getPostLikes = getPostLikes;
window.incrementPostLikes = incrementPostLikes;
window.saveComment = saveComment;
window.setupCommentListener = setupCommentListener; // Changed loadComments to listener
window.sanitize = sanitize;
setupLikeButtonListeners();
