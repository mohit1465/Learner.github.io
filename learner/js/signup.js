const auth = firebase.auth();

// Sign Up functionality
document.getElementById('signupForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        document.getElementById('signup-response').innerText = 'Sign up successful!';
        setTimeout(() => window.location.href = 'login.html', 1000); // Redirect after 1 second
    } catch (error) {
        document.getElementById('signup-response').innerText = 'Error during sign up.';
        console.error(error);
    }
});
