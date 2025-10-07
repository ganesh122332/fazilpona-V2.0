import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {
    getFirestore, collection, addDoc, getDoc, doc, setDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";



// Replace with your Firebase config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDFRveJlgcd5wIfclx28vYxos_w2S7z59M",
    authDomain: "ff-tournament-gonu.firebaseapp.com",
    projectId: "ff-tournament-gonu",
    storageBucket: "ff-tournament-gonu.firebasestorage.app",
    messagingSenderId: "963168625937",
    appId: "1:963168625937:web:93a319df3e2838caeb98b0",
    measurementId: "G-FWSJE93RJF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Elements
const authSection = document.getElementById("auth-section");
const detailsSection = document.getElementById("details-section");
const chatSection = document.getElementById("chat-section");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const saveDetailsBtn = document.getElementById("saveDetailsBtn");
const sendBtn = document.getElementById("sendBtn");
const name = document.getElementById("name");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const password = document.getElementById("password");
const dob = document.getElementById("dob");
const alias = document.getElementById("alias");
const bio = document.getElementById("bio");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const closeBtn = document.getElementById("closeBtn");
const alertCont = document.getElementById("message");

let currentUser = null;
let currentAlias = "";

// Auth State
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = doc(db, "users", user.uid);
        const snap = await getDoc(userDoc);
        if (snap.exists()) {
            currentAlias = snap.data().alias || "Unknown";
            showChat();
        } else {
            if (currentUser.emailVerified) {
                showDetailsForm();
            }
            if (!currentUser.emailVerified) {
                showAuth();
                document.getElementById("msg").innerText = "Please verify your email first to log in!";
                document.getElementById("errAlrt").style.display = "block";
                alertCont.innerText = "Your email id " + user.email + " is not verified. Please verify your email via the link sent to your email to log in!";
            }
        }
    } else {
        currentUser = null;
        showAuth();
    }
});

// UI Switch
function showAuth() {
    authSection.classList.remove("hidden");
    detailsSection.classList.add("hidden");
    chatSection.classList.add("hidden");
    acLoader.classList.add("hidden");
}
function showDetailsForm() {
    authSection.classList.add("hidden");
    detailsSection.classList.remove("hidden");
    chatSection.classList.add("hidden");
    acLoader.classList.add("hidden");
}
function showChat() {
    authSection.classList.add("hidden");
    detailsSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    loadMessages();
    acLoader.classList.add("hidden");
}

// Login
loginBtn.onclick = async () => {
    acLoader.classList.remove("hidden");
    if (email.value === "" || password.value === "") {
        alertCont.innerText = "Please fill all fields";
        acLoader.classList.add("hidden");
        return;
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        currentUser = userCredential.user;
        console.log("Login success", currentUser);

        if (!currentUser.emailVerified) {
            alertCont.innerText = "Please verify your email first! Verification email sent again.";
            await signOut(auth);
            acLoader.classList.add("hidden");
            return;
        }

        const userDoc = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userDoc);
        if (snap.exists()) {
            currentAlias = snap.data().alias || "Unknown";
            showChat();
            acLoader.classList.add("hidden");
        } else {
            showDetailsForm();
            acLoader.classList.add("hidden");
        }
    } catch (e) {
        console.error("Login error:", e);
        alertCont.innerText = e.message;
        acLoader.classList.add("hidden");
    }
};



// Signup
signupBtn.onclick = async () => {
    acLoader.classList.remove("hidden");
    if (email.value === "" || password.value === "") {
        alertCont.innerText = "Please fill all fields";
        acLoader.classList.add("hidden");
        return;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        currentUser = userCredential.user;
        console.log("Signup success", currentUser);
        await sendEmailVerification(currentUser);
        document.getElementById("msg").innerText = "Verification email sent! Verify your email first then login to proceed.";
        document.getElementById("errAlrt").style.display = "block";
        alertCont.innerText = "Please verify your email id through the link sent to" + email + ", then login to proceed.";
        await signOut(auth);
        showAuth();
        acLoader.classList.add("hidden");
        detailsSection.classList.add("hidden");
    } catch (e) {
        console.error("Signup error:", e);
        document.getElementById("msg").innerText = e.message;
        document.getElementById("errAlrt").style.display = "block";
        acLoader.classList.add("hidden")
    }
};
// Google Login
const googleLoginBtn = document.getElementById("googleBtn1");

googleLoginBtn.onclick = async () => {
    acLoader.classList.remove("hidden");
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;

        // Check if user exists in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        //details form
        if (userSnap.exists()) {
            currentAlias = userSnap.data().alias || "Unknown";
            showChat();
            acLoader.classList.add("hidden");
            return;
        } 
        authSection.classList.add("hidden");
        detailsSection.classList.remove("hidden");
        chatSection.classList.add("hidden");
        acLoader.classList.add("hidden");
        name.value = currentUser.displayName || "";
        document.getElementById("emailArea").innerText = currentUser.email;
        acLoader.classList.add("hidden");

        // if (!userSnap.exists()) {
        //   // If user is new, create a user document
        //   await setDoc(userDocRef, {
        //     uid: currentUser.uid,
        //     email: currentUser.email,
        //     name: currentUser.displayName || "",
        //     alias: currentUser.displayName?.split(" ")[0] || "User",
        //     bio: "",
        //     dob: "",
        //     mobile: "",
        //     firstLogin: new Date().toISOString()
        //   });
        // }

        // currentAlias = currentUser.displayName?.split(" ")[0] || "User";
        // showChat();

    } catch (e) {
        console.error("Google login error:", e);
        alertCont.innerText = "Google login failed. (" + e.message + ")";
        acLoader.classList.add("hidden");
    }
};



var dorrt = document.getElementById("details-section");
// Save details
saveDetailsBtn.onclick = async () => {
    acLoader.classList.remove("hidden");
    dorrt.hidden = true;
    if (name.value === "" || dob.value === "" || alias.value === "" || mobile.value === "") {
        document.getElementById("errAlrt").style.display = "block";
        document.getElementById("msg").innerText = "Plese fill all the fields.";
        acLoader.classList.add("hidden");
        dorrt.hidden = false;
        return;
    }
    // try {
    // const aliasRef = doc(db, "alias", alias.value);
    // const aliasSnap = await getDoc(aliasRef);

    // if (aliasSnap.exists()) {
    //     alert("⚠️ This alias name is already taken! Try another one.");
    //     document.getElementById("errAlrt").style.display = "block";
    //     document.getElementById("msg").innerText = "Alias ";
    //     acLoader.classList.add("hidden");
    //     return; // stop here
    // }
    try {
        await setDoc(doc(db, "users", currentUser.uid), {
            uid: currentUser.uid, email: currentUser.email, dob: dob.value, alias: alias.value, bio: bio.value, name: name.value, mobile: mobile.value, firstLogin: new Date().toISOString()
        });
        await setDoc(doc(db, "alias", alias.value), {
            email: currentUser.email,
            uid: currentUser.uid
        })
        currentAlias = alias.value;
        acLoader.classList.add("hidden");
        dorrt.hidden = false;
        showChat();
    } catch (e) { 
        acLoader.classList.add("hidden");
        dorrt.hidden = false;
        console.error(e); }
};

// Send message
sendBtn.onclick = async () => {
    if (messageInput.value.trim() === "") return;
    const massageChat = messageInput.value;
    messageInput.value = "";
    try {
        await addDoc(collection(db, "massages"), {
            uid: currentUser.uid, alias: currentAlias, text: massageChat, time: new Date()
        });
        chatCnt.style.display = "block"; // show
        chatCnt.style.animation = "none";
        chatCnt.style.animation = "massSent 1s";
        chatCnt.addEventListener("animationend", () => {
            chatCnt.style.display = "none";
        });
    } catch (e) { console.error(e); }
};

// Real-time messages with bubbles
function loadMessages() {
    const q = query(collection(db, "massages"), orderBy("time"),);
    onSnapshot(q, snapshot => {
        messagesDiv.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement("div");
            div.className = `p-2 mb-1 rounded max-w-[80%] break-words`;
            // Style for self vs others
            if (data.uid === currentUser.uid) div.className += " bg-blue-100 text-black self-end";
            else div.className += " bg-gray-300 text-black self-start";
            // Add alias + text + timestamp
            const time = new Date(data.time?.seconds ? data.time.seconds * 1000 : data.time);
            let hours = time.getHours();
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12; // handle 0 as 12

            const minutes = time.getMinutes().toString().padStart(2, "0");
            const day = time.getDate().toString().padStart(2, "0");
            const month = (time.getMonth() + 1).toString().padStart(2, "0");

            const formattedTime = `${hours}:${minutes}${ampm},${day}/${month}`;
            div.innerHTML = `${data.alias || "Unknown"}: ${data.text} <br><span class="timeDt">[${formattedTime}]</span>`;
            messagesDiv.appendChild(div);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

closeBtn.onclick = () => {
    document.getElementById("errAlrt").style.display = "none";
    document.getElementById("msg").innerText = "Loading...";
}

document.getElementById("scroll-botm").addEventListener("click", () => {
    messagesDiv.scrollTo({ top: messagesDiv.scrollHeight, behavior: "smooth" });
});
