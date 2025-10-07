import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";



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
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("acLoader").hidden = false;
        document.getElementById("account-card").hidden = true;
        const uid = user.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);


        if (docSnap.exists()) {
            // console.log("Document data:", docSnap.data());
            const data = docSnap.data();

            const time = new Date(data.time?.seconds ? data.time.seconds * 1000 : data.firstLogin); // as stored as a ISO string
            // const time2 = new Date(data.time?.seconds ? data.time.seconds * 1000 : data.time);

            let hours = time.getHours();
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12; // handle 0 as 12

            const minutes = time.getMinutes().toString().padStart(2, "0");
            const day = time.getDate().toString().padStart(2, "0");
            const month = (time.getMonth() + 1).toString().padStart(2, "0");

            const formattedTime = `${hours}:${minutes}${ampm},${day}/${month}`;
            // Fill page fields
            document.getElementById("name2").textContent = data.name.toUpperCase() || "—";
            document.getElementById("alias2").textContent = "@" + data.alias || "—";
            document.getElementById("email2").textContent = user.email || "—";
            document.getElementById("dob2").textContent = data.dob || "—";
            document.getElementById("first-login2").textContent = formattedTime || "—";
            document.getElementById("uid2").textContent = uid;
            document.getElementById("mobile2").textContent = "+91 " + data.mobile || "—";
            document.getElementById("bio2").textContent = data.bio || "I am using Fazilpona Chat App!";

            document.getElementById("dobEdit").value = data.dob;
            document.getElementById("aliasEdit").value = data.alias;
            document.getElementById("mobileEdit").value = data.mobile;
            document.getElementById("bioEdit").value = data.bio || "I am using Fazilpona Chat App!";
            document.getElementById("nameEdit").value = data.name;
            document.getElementById("prvdr").textContent = user.providerData[0]?.providerId || "—";

            // Set avatar initial
            if (user.photoURL) {
                document.getElementById("avatar").textContent = "";
                document.getElementById("avatar").style.backgroundImage = `url(${user.photoURL})`;
                document.getElementById("avatar").style.backgroundSize = "cover";
                document.getElementById("avatar").style.backgroundPosition = "center";
            } else {
                document.getElementById("avatar").style.backgroundImage = "";
                document.getElementById("avatar").textContent = data.name
                ? data.name.charAt(0).toUpperCase()
                : "?";
            }
            
            document.getElementById("acLoader").hidden = true;
            document.getElementById("account-card").hidden = false;
        } else {
            document.getElementById("errAlrt").style.display = "block";
                document.getElementById("msg").innerText = "No user data found in Firestore!";
        }
    } else {
        // Not logged in → redirect to login page
        window.location.href = "index.html";
    }
});

// save edit details
saveDetailsBtn2.onclick = async () => {
    const updatedData = {
        name: document.getElementById("nameEdit").value,
        dob: document.getElementById("dobEdit").value,
        alias: document.getElementById("aliasEdit").value,
        mobile: document.getElementById("mobileEdit").value,
        bio: document.getElementById("bioEdit").value,
    };
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), updatedData);
        // Update displayed values
        document.getElementById("name2").textContent = updatedData.name.toUpperCase() || "—";
        document.getElementById("alias2").textContent = "@" + updatedData.alias || "—";
        document.getElementById("dob2").textContent = updatedData.dob || "—";
        document.getElementById("mobile2").textContent = "+91 " + updatedData.mobile || "—";
        document.getElementById("bio2").textContent = updatedData.bio || "I am using Fazilpona Chat App!";
        // Update avatar initial
        document.getElementById("avatar").textContent = updatedData.name
            ? updatedData.name.charAt(0).toUpperCase()
            : "?";
        document.getElementById("mainEditCont").hidden = true;
    } catch (e) {
        console.error("Error updating document: ", e);
        document.getElementById("errAlrt").style.display = "block";
        document.getElementById("msg").innerText = "Failed to update details. Try again later.";

    }
};


// ✅ Logout
window.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn2");
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "index.html";
    });

    const resetBtn = document.getElementById("reset-pass");
    resetBtn.addEventListener("click", async () => {
        const user = auth.currentUser;

        if (user && user.email) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                alert(`Password reset link sent to ${user.email}`);
                document.getElementById("msg").innerText = "Password reset link sent to " + user.email;
            } catch (error) {
                console.error("Error sending reset email:", error);
                document.getElementById("errAlrt").style.display = "block";
                document.getElementById("msg").innerText = "Failed to send reset email. Try again later.";
            }
        } else {
            document.getElementById("errAlrt").style.display = "block";
                document.getElementById("msg").innerText = "No logged-in user found!";
        }
    });
    const resetBtn2 = document.getElementById("reset-pass2");
    resetBtn2.addEventListener("click", async () => {
        const user = auth.currentUser;

        if (user && user.email) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                document.getElementById("errAlrt").style.display = "block";
                document.getElementById("msg").innerText = "Password reset link sent to " + user.email;
            } catch (error) {
                console.error("Error sending reset email:", error);
                document.getElementById("errAlrt").style.display = "block";
                document.getElementById("msg").innerText = "Failed to send reset email. Try again later.";
            }
        } else {
            document.getElementById("errAlrt").style.display = "block";
                document.getElementById("msg").innerText = "No logged-in user found!";
        }
    });
});


// basic popup in off
document.getElementById("edit-btn1").addEventListener("click", () => {
    document.getElementById("mainEditCont").hidden = false;
});
document.getElementById("editTop").addEventListener("click", () => {
    document.getElementById("mainEditCont").hidden = false;
    document.getElementById("mainEditCont").scrollTo({ top: 0, behavior: "smooth" });
});
cancelBtnEdit.addEventListener("click", () => {
    document.getElementById("mainEditCont").hidden = true;
});

closeBtn.onclick = () => {
    document.getElementById("errAlrt").style.display = "none";
    document.getElementById("msg").innerText = "Loading...";
}