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

// Sign Up functionality
document.getElementById('signupForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const designation = document.getElementById('designation').value;
    const dob = document.getElementById('dob').value;

    const userData = {
        name: name,
        username: username,
        email: email,
        password: password,
        designation: designation,
        dob: dob
    };

    const filePath = `data/users/${username}.json`;
    const fileContent = JSON.stringify(userData);

    const result = await createFileInGitHub(filePath, fileContent, `Add new user: ${username}`);

    if (result.content) {
        document.getElementById('signup-response').innerText = 'Sign up successful!';
        setTimeout(() => window.location.href = 'login.html', 1000); // Redirect after 2 seconds
    } else {
        document.getElementById('signup-response').innerText = 'Error during sign up. Username might already exist.';
        console.error(result);
    }
});

// Login functionality
document.getElementById('loginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const filePath = `data/users/${username}.json`;

    try {
        const data = await getFileFromGitHub(filePath);

        if (data && data.content) {
            const userData = JSON.parse(atob(data.content));

            if (userData.password === password) {
                localStorage.setItem('loggedInUser', JSON.stringify(userData));
                window.location.href = '../main.html';
            } else {
                alert('Incorrect password.');
            }
        } else {
            alert('User not found.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
});

// Check if a user is logged in and update UI accordingly
function checkLogin() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const userInfo = document.getElementById('user-info');

    if (user) {
        userInfo.innerHTML = `
            <h3>Hello, ${user.name}!</h3>
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
}

// Logout function
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'main.html';
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
