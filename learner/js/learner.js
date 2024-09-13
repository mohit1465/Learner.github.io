// GitHub API details
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USERNAME = 'Mohit1465';  // Your GitHub username
const GITHUB_REPOSITORY = 'Learner.github.io';  // Your GitHub repository name
const GITHUB_TOKEN = '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';  // Replace with your actual GitHub token (regenerate if needed)

// Helper function to create a new file in the GitHub repository
async function createFileInGitHub(path, content, message) {
    const base64Content = btoa(content);

    const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            content: base64Content
        })
    });

    return response.json();
}

// Helper function to get a file from GitHub
async function getFileFromGitHub(path) {
    const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${path}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    });

    return response.json();
}

// Initialize Firebase Authentication
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

// Check if a user is logged in and update UI accordingly
function checkLogin() {
    auth.onAuthStateChanged(user => {
        const userInfo = document.getElementById('user-info');

        if (user) {
            userInfo.innerHTML = `
                <h3>Hello, ${user.email}!</h3>
                <a href="#" id="logoutBtn">Logout</a>
            `;
            document.getElementById('logoutBtn')?.addEventListener('click', logout);
        } else {
            userInfo.innerHTML = `
                <h3>Hello, User!</h3>
                <a href="authentication/login.html">Login</a> | 
                <a href="authentication/signup.html">Sign Up</a>
            `;
        }
    });
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'main.html';
    }).catch(error => {
        console.error('Error during logout:', error);
    });
}

// Profile Photo and User Menu Interaction
document.addEventListener('DOMContentLoaded', function() {
    const userMenu = document.getElementById('user-info');
    const profilePhoto = document.getElementById('profile-photo');

    profilePhoto?.addEventListener('click', function() {
        userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Close user menu if clicked outside
    document.addEventListener('click', function(event) {
        if (!userMenu.contains(event.target) && !profilePhoto.contains(event.target)) {
            userMenu.style.display = 'none';
        }
    });

    // Check login status on page load
    checkLogin();
});
