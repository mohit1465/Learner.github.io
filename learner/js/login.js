document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Get user data from local storage
    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username] && users[username].password === password) {
        alert('Login successful!');
        // Redirect to main page
        window.location.href = '../main.html';
    } else {
        alert('Invalid username or password.');
    }
});
