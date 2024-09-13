// Initialize Firebase Authentication
const auth = firebase.auth();
// Login functionality
document.getElementById('loginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = '../main.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});
