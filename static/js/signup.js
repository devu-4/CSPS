// Firebase Configuration


// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAY0xExwBN3fi_UeAW3_AnmTDzc_qmYUWc",
    authDomain: "csps-98ea1.firebaseapp.com",
    databaseURL: "https://csps-98ea1-default-rtdb.firebaseio.com",
    projectId: "csps-98ea1",
    storageBucket: "csps-98ea1.firebasestorage.app",
    messagingSenderId: "789567207002",
    appId: "1:789567207002:web:217a82816a5d061e418a63",
    measurementId: "G-43KT2W5E4R"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Sign up function
function signUp() {
    const username = document.getElementById("floatingText").value;
    const email = document.getElementById("floatingInput").value;
    const password = document.getElementById("floatingPassword").value;

    // Check if all fields are filled
    if (username && email && password) {
        // Create user with Firebase Authentication
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up successfully
                var user = userCredential.user;

                // Store additional user data (username) in Firestore
                firebase.firestore().collection('users').doc(user.uid).set({
                    username: username,
                    email: email
                })
                .then(() => {
                    alert("Account created successfully!");
                    window.location.href = "/signin"; // Redirect to sign-in page
                })
                .catch((error) => {
                    alert("Error saving user data: " + error.message);
                });
            })
            .catch((error) => {
                alert("Error signing up: " + error.message);
            });
    } else {
        alert("Please fill all fields.");
    }
}
