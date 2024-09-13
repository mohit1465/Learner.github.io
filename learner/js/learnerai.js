// Check login status
const auth = firebase.auth();
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
    fetch(`https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/contents/chat-data/${username}.json`, {
        headers: {
            'Authorization': 'Bearer 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'
        }
    })
    .then(response => response.json())
    .then(data => {
        const chatData = JSON.parse(atob(data.content));
        let chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = '';
        for (let dateTime in chatData) {
            addMessage(chatData[dateTime].user, "user-message");
            addBotMessage(chatData[dateTime].eva);
        }
    })
    .catch(error => console.error("Error loading chat history:", error));
}

// Function to save chat history based on username
function saveChatHistory(username, userMessage, evaMessage) {
    fetch(`https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/contents/chat-data/${username}.json`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update chat history',
            content: btoa(JSON.stringify({
                [new Date().toLocaleString()]: { user: userMessage, eva: evaMessage }
            })),
            sha: ''  // Provide the sha of the existing file if available
        })
    })
    .catch(error => console.error("Error saving chat history:", error));
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
    .catch(error => console.error("Error fetching Groq response:", error));
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

// Function to speak text
function speakText(text) {
    fetch('https://api.deepgram.com/v1/speak?model=aura-luna-en', {
        method: 'POST',
        headers: {
            'Authorization': 'Token YOUR_DEEPGRAM_API_KEY',
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
        alert("Currently our Text to Speak function is not too good as others, An error has occurred this time. We are working on it...");
    });
}

// Function to track user stay time
let startTime = new Date();

window.addEventListener('beforeunload', function() {
    const endTime = new Date();
    const stayDuration = Math.floor((endTime - startTime) / 1000); // Duration in seconds
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    if (user) {
        fetch(`https://api.github.com/repos/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/contents/user-stay-time/${user.username}.json`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update stay time',
                content: btoa(JSON.stringify({
                    [new Date().toLocaleDateString()]: stayDuration
                })),
                sha: ''  // Provide the sha of the existing file if available
            })
        })
        .catch(error => console.error("Error saving stay time:", error));
    }
});
