// Check login status
function checkLogin() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const logoutSignup = document.getElementById('logout-signup');

    if (user) {
        userName.textContent = `Hello, ${user.name}!`;
        logoutSignup.innerHTML = '<a href="#" id="logoutBtn">Logout</a>';
        document.getElementById('logoutBtn').addEventListener('click', logout);
        loadChatHistory(user.username);  // Load chat history when the user logs in
    } else {
        userName.textContent = 'Hello, User!';
        logoutSignup.innerHTML = `
            <a href="../authentication/login.html">Login</a> | 
            <a href="../authentication/signup.html">Sign Up</a>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '../main.html';
}

// Update date and time every second
function updateDateTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString();
    const timeString = now.toLocaleTimeString();
    document.getElementById('date-time').textContent = `${dateString} ${timeString}`;
}
setInterval(updateDateTime, 1000);

// Toggle user menu visibility
document.getElementById('profile-photo').addEventListener('click', () => {
    const userMenu = document.getElementById('user-menu');
    userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
});

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
document.body.classList.add('light-theme');
document.body.classList.remove('dark-theme');
themeToggle.checked = true;

themeToggle.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    }
});

checkLogin();

// Function to load chat history based on username
function loadChatHistory(username) {
    let chatData = JSON.parse(localStorage.getItem(username + '_chat')) || {};
    let chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
    for (let dateTime in chatData) {
        addMessage(chatData[dateTime].user, "user-message");
        addBotMessage(chatData[dateTime].eva);
    }
}

// Function to save chat history based on username
function saveChatHistory(username, userMessage, evaMessage) {
    let chatData = JSON.parse(localStorage.getItem(username + '_chat')) || {};
    let dateTime = new Date().toLocaleString();
    chatData[dateTime] = { user: userMessage, eva: evaMessage };
    localStorage.setItem(username + '_chat', JSON.stringify(chatData));
}

// Function to fetch response from Groq API
function fetchGroqResponse(userInput) {
    fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [{ role: "user", content: userInput }],
            model: "llama3-8b-8192"
        })
    })
    .then(response => response.json())
    .then(data => {
        let botResponse = data.choices[0].message.content;

        // Convert **content** to <strong>content</strong> for bold text
        botResponse = botResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert \n to <br> for line breaks
        botResponse = botResponse.replace(/\n/g, '<br>');

        addBotMessage(botResponse);
        saveChatHistory(currentUser.username, userInput, botResponse); // Save chat history with username
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

// Function to add user or bot messages to the chat box
function addMessage(text, className) {
    let chatBox = document.getElementById("chat-box");
    let message = document.createElement("div");
    message.classList.add("message", className);
    message.innerText = text;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to add bot messages with additional options (copy & speak)
function addBotMessage(text) {
    let chatBox = document.getElementById("chat-box");
    let botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot-message';

    // Use innerHTML to allow HTML tags to be rendered
    botMessageDiv.innerHTML = text;

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'message-options';

    const copyButton = document.createElement('img');
    copyButton.src = '../img/copy.png';
    copyButton.className = 'copy-button';

    copyButton.addEventListener('click', function () {
        navigator.clipboard.writeText(text);
    });

    const speakButton = document.createElement('img');
    speakButton.src = '../img/speak.png';
    speakButton.className = 'speak-button';

    speakButton.addEventListener('click', function () {
        speakText(text);
    });

    optionsDiv.appendChild(copyButton);
    optionsDiv.appendChild(speakButton);
    botMessageDiv.appendChild(optionsDiv);

    chatBox.appendChild(botMessageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Event listener for send button
document.getElementById('send-btn').addEventListener('click', () => {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() !== "") {
        addMessage(userInput, "user-message");
        fetchGroqResponse(userInput);
        document.getElementById('user-input').value = "";
    }
});

function speakText(text) {
    fetch('https://api.deepgram.com/v1/speak?model=aura-luna-en', {
        method: 'POST',
        headers: {
            'Authorization': 'Token 86c3974fa5e4bf7a7de5795ba9045e5021bd983d',
            'Content-Type': 'text/plain'
        },
        body: text
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.addEventListener('canplaythrough', () => {
            audio.play().catch(error => {
                console.error('Audio playback failed:', error);
                fallbackToSpeechSynthesis(text);
            });
        });

        audio.addEventListener('error', error => {
            console.error('Audio element error:', error);
            fallbackToSpeechSynthesis(text);
        });
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Currently our Text to Speak function is not too good as others, An error has occured this time. We are working on it...")
    });
}

