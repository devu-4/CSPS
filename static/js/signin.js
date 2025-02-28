// // Initialize Firebase
// var firebaseConfig = {
//     apiKey: "AIzaSyAY0xExwBN3fi_UeAW3_AnmTDzc_qmYUWc",
//     authDomain: "csps-98ea1.firebaseapp.com",
//     databaseURL: "https://csps-98ea1-default-rtdb.firebaseio.com",
//     projectId: "csps-98ea1",
//     storageBucket: "csps-98ea1.firebasestorage.app",
//     messagingSenderId: "789567207002",
//     appId: "1:789567207002:web:217a82816a5d061e418a63",
//     measurementId: "G-43KT2W5E4R"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// // Sign in function
// function signIn() {
//     const email = document.getElementById("floatingInput").value;
//     const password = document.getElementById("floatingPassword").value;

//     // Validate the form
//     if (email && password) {
//         // Attempt to sign in with Firebase Authentication
//         firebase.auth().signInWithEmailAndPassword(email, password)
//             .then((userCredential) => {
//                 // Signed in successfully
//                 var user = userCredential.user;
//                 // alert("Signed in successfully!");
//                 // Redirect to the home page or dashboard
//                 window.location.href = "/login"; // Change the URL to the correct one
//             })
//             .catch((error) => {
//                 alert("Error signing in: " + error.message);
//             });
//     } else {
//         alert("Please fill in both email and password.");
//     }
// }

// Sign in function
function signIn() {
    const email = document.getElementById("floatingInput").value;
    const password = document.getElementById("floatingPassword").value;

    // Validate the form
    if (email && password) {
        // Create form data to send to Flask backend
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        console.log(email)
        // Send a POST request to Flask for login
        fetch('/login', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.redirected) {
                // If login is successful, Flask will redirect
                window.location.href = response.url;
            } else {
                // If not redirected, show an error message
                alert("Login failed. Please check your credentials.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred during login. Please try again.");
        });
    } else {
        alert("Please fill in both email and password.");
    }
}

