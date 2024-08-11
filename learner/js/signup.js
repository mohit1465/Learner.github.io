document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const designation = document.getElementById('designation').value;

    const userData = {
        name: name,
        email: email,
        password: password,
        designation: designation,
        rating: ""
    };

    // Save user data to individual file
    localStorage.setItem(`user_${username}`, JSON.stringify(userData));

    // Save user data to users.json
    let users = JSON.parse(localStorage.getItem('users')) || {};
    users[username] = userData;
    localStorage.setItem('users', JSON.stringify(users));

    alert('Signup successful!');
    window.location.href = 'login.html';
});
