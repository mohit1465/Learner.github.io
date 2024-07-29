let currentTabId = 1;
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
    extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-L": function(cm) {
            let line = prompt("Enter line number:");
            if (line) cm.setCursor({line: Number(line) - 1, ch: 0});
        },
        "Ctrl-F": "findPersistent"
    },
    hintOptions: { // Enable autocomplete
        completeSingle: false
    }
});

const tabContents = {};

document.getElementById('new-file').addEventListener('click', createNewFile);
document.getElementById('open-file').addEventListener('click', () => document.getElementById('file-input').click());
document.getElementById('save-file').addEventListener('click', saveFile);
document.getElementById('file-input').addEventListener('change', handleFileOpen);
document.getElementById('change-extension').addEventListener('click', changeExtension);
document.getElementById('change-name').addEventListener('click', changeFileName);

function createNewFile() {
    let baseName = 'Untitled';
    let ext = 'txt';
    let newName = `${baseName}.${ext}`;
    let counter = 2;

    while (document.getElementById(newName)) {
        newName = `${baseName}_${counter}.${ext}`;
        counter++;
    }

    addTab(newName);
}

function addTab(name) {
    const tabContainer = document.getElementById('tabs');
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.id = name;
    tab.textContent = name;

    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.className = 'close-tab';
    closeBtn.onclick = () => {
        if (tabContainer.children.length > 1) {
            if (confirm('Are you sure you want to close this tab?')) {
                tab.remove();
                if (tab.classList.contains('active')) {
                    tabContainer.children[0].click();
                }
            }
        } else {
            alert('At least one tab must be open.');
        }
    };

    tab.appendChild(closeBtn);
    tab.onclick = () => setActiveTab(tab);

    tabContainer.appendChild(tab);
    setActiveTab(tab);
}

function setActiveTab(tab) {
    // Save current tab content
    if (currentTabId) {
        tabContents[currentTabId] = editor.getValue();
    }

    // Switch to the new tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    tab.classList.add('active');
    currentTabId = tab.id;

    // Load new tab content
    editor.setValue(tabContents[currentTabId] || '');

    // Update suggestions
    updateSuggestions(currentTabId);
}

function updateSuggestions(filename) {
    const extension = filename.split('.').pop();
    const suggestionContainer = document.querySelector('.suggestions');
    suggestionContainer.innerHTML = '';

    if (suggestions[`.${extension}`]) {
        suggestions[`.${extension}`].forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = suggestion;
            suggestionDiv.onclick = () => {
                editor.replaceSelection(suggestion);
                editor.focus(); // Ensure the editor gets focus
            };
            suggestionContainer.appendChild(suggestionDiv);
        });
    }
}

function saveFile() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const blob = new Blob([editor.getValue()], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = activeTab.id;
        a.click();
    }
}

function handleFileOpen(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const name = file.name;
            addTab(name);
            editor.setValue(content);
        };
        reader.readAsText(file);
    }
}

function changeExtension() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const newExtension = prompt('Enter the new file extension (e.g., js, txt, html):');
        if (newExtension) {
            const nameParts = activeTab.id.split('.');
            nameParts.pop();
            nameParts.push(newExtension);
            const newId = nameParts.join('.');

            // Rename in tabContents
            tabContents[newId] = tabContents[activeTab.id];
            delete tabContents[activeTab.id];

            activeTab.id = newId;
            activeTab.textContent = newId;

            // Re-add close button
            const closeBtn = document.createElement('span');
            closeBtn.textContent = '×';
            closeBtn.className = 'close-tab';
            closeBtn.onclick = () => {
                if (document.getElementById('tabs').children.length > 1) {
                    if (confirm('Are you sure you want to close this tab?')) {
                        delete tabContents[activeTab.id]; // Remove content of closed tab
                        activeTab.remove();
                        if (activeTab.classList.contains('active')) {
                            document.getElementById('tabs').children[0].click();
                        }
                    }
                } else {
                    alert('At least one tab must be open.');
                }
            };

            activeTab.appendChild(closeBtn);
            updateSuggestions(newId);
        }
    }
}

function changeFileName() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const newName = prompt('Enter the new file name (without extension):');
        if (newName) {
            const nameParts = activeTab.id.split('.');
            const extension = nameParts.pop();
            const newId = `${newName}.${extension}`;

            // Rename in tabContents
            tabContents[newId] = tabContents[activeTab.id];
            delete tabContents[activeTab.id];

            activeTab.id = newId;
            activeTab.textContent = newId;

            // Re-add close button
            const closeBtn = document.createElement('span');
            closeBtn.textContent = '×';
            closeBtn.className = 'close-tab';
            closeBtn.onclick = () => {
                if (document.getElementById('tabs').children.length > 1) {
                    if (confirm('Are you sure you want to close this tab?')) {
                        delete tabContents[activeTab.id]; // Remove content of closed tab
                        activeTab.remove();
                        if (activeTab.classList.contains('active')) {
                            document.getElementById('tabs').children[0].click();
                        }
                    }
                } else {
                    alert('At least one tab must be open.');
                }
            };

            activeTab.appendChild(closeBtn);
            updateSuggestions(newId);
        }
    }
}

editor.on('cursorActivity', () => {
    const { line, ch } = editor.getCursor();
    document.getElementById('cursor-position').textContent = `Ln: ${line + 1}, Col: ${ch + 1}`;
});

editor.on('change', () => {
    const lineCount = editor.lineCount();
    document.getElementById('total-lines').textContent = `Total Ln: ${lineCount}`;
    document.getElementById('file-size').textContent = `File Size: ${(new Blob([editor.getValue()]).size / 1024).toFixed(2)} KB`;
});

function setTheme(theme) {
    document.body.className = theme;
    editor.setOption('theme', theme === 'light' ? 'default' : 'dracula');
}

// Initialize with one default tab
window.onload = () => {
    addTab('Untitled.txt');
    setTheme('light');
};
