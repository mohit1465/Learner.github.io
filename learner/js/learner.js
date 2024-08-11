document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.main-banner img');
    let currentIndex = 0;

    function showNextImage() {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }

    setInterval(showNextImage, 3000); // Set interval to 3000ms (3 seconds)
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

// Handle Signup
document.getElementById('signupForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const userExists = localStorage.getItem(username);

    if (userExists) {
        alert('Username already exists. Please choose a different username.');
    } else {
        const user = {
            name: document.getElementById('name').value,
            username: username,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            designation: document.getElementById('designation').value,
            dob: document.getElementById('dob').value,
        };

        localStorage.setItem(username, JSON.stringify(user));
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        window.location.href = '../main.html';
    }
});

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const storedUser = JSON.parse(localStorage.getItem(username));

    if (storedUser && storedUser.password === password) {
        localStorage.setItem('loggedInUser', JSON.stringify(storedUser));
        window.location.href = '../main.html';
    } else {
        alert('Invalid username or password!');
    }
});

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
});

// Check login status on page load
checkLogin();
