let currentTabId = 'Untitled.txt';
let currentFileHandle = null; // This variable will store the current file handle

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
document.getElementById('open-file').addEventListener('click', handleFileOpen);
document.getElementById('save-file').addEventListener('click', saveFile);
document.getElementById('save-as-file').addEventListener('click', saveAsFile);
document.getElementById('file-input').addEventListener('change', handleFileOpen);
document.getElementById('change-extension').addEventListener('click', changeExtension);
document.getElementById('change-name').addEventListener('click', changeFileName);

editor.on('inputRead', function(instance, changeObj) {
    const cursor = editor.getCursor();
    const token = editor.getTokenAt(cursor);
    const searchTerm = token.string.trim();

    if (searchTerm) {
        updateFilteredSuggestions(searchTerm);
    } else {
        updateSuggestions(currentTabId);
    }
});

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
                delete tabContents[tab.id]; // Remove content of closed tab
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
    if (currentTabId) {
        tabContents[currentTabId] = editor.getValue();
    }

    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    tab.classList.add('active');
    currentTabId = tab.id;

    editor.setValue(tabContents[currentTabId] || '');
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
                editor.focus(); 
            };
            suggestionContainer.appendChild(suggestionDiv);
        });
    }
}

function updateFilteredSuggestions(searchTerm) {
    const activeTab = document.querySelector('.tab.active');
    const extension = activeTab.id.split('.').pop();
    const suggestionContainer = document.querySelector('.suggestions');
    suggestionContainer.innerHTML = '';

    if (suggestions[`.${extension}`]) {
        const filteredSuggestions = suggestions[`.${extension}`].filter(suggestion =>
            suggestion.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredSuggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = suggestion;
            suggestionDiv.onclick = () => {
                editor.replaceSelection(suggestion);
                editor.focus(); 
            };
            suggestionContainer.appendChild(suggestionDiv);
        });
    }
}

async function saveFile() {
    if (!currentFileHandle) {
        saveAsFile();
        return;
    }

    const writable = await currentFileHandle.createWritable();
    await writable.write(editor.getValue());
    await writable.close();
    alert('File saved successfully.');
}

async function saveAsFile() {
    // Get the current tab's name or provide a default name
    const defaultFileName = currentTabId || 'Untitled.txt';
    
    // Prepare file options with a suggested file name
    const options = {
        suggestedName: defaultFileName,
        types: [{
            description: 'Text Files',
            accept: { 'text/plain': ['.txt'] }
        }]
    };

    try {
        // Show the Save File Picker dialog
        const fileHandle = await window.showSaveFilePicker(options);
        const newFileName = fileHandle.name;

        // If the file name changes, update the tab and content
        if (currentFileHandle) {
            const existingTab = document.getElementById(currentTabId);
            if (existingTab) {
                existingTab.id = newFileName;
                existingTab.textContent = newFileName;

                // Ensure the close button is present
                const closeBtn = existingTab.querySelector('.close-tab');
                if (!closeBtn) {
                    const newCloseBtn = document.createElement('span');
                    newCloseBtn.textContent = '×';
                    newCloseBtn.className = 'close-tab';
                    newCloseBtn.onclick = () => {
                        if (document.querySelectorAll('.tab').length > 1) {
                            if (confirm('Are you sure you want to close this tab?')) {
                                delete tabContents[existingTab.id]; // Remove content of closed tab
                                existingTab.remove();
                                if (existingTab.classList.contains('active')) {
                                    document.querySelector('.tab').click(); // Activate first tab
                                }
                            }
                        } else {
                            alert('At least one tab must be open.');
                        }
                    };
                    existingTab.appendChild(newCloseBtn);
                }

                // Update the tab contents and name
                tabContents[newFileName] = editor.getValue();
                delete tabContents[currentTabId];
                currentTabId = newFileName;
                editor.setValue(tabContents[currentTabId] || '');
            }
        }

        // Update the file handle and save the file
        currentFileHandle = fileHandle;
        await saveFile();
    } catch (err) {
        console.error('Error saving file:', err);
    }
}


async function handleFileOpen() {
    try {
        [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const contents = await file.text();
        document.getElementById('editor').value = contents;

        addTab(file.name);
        editor.setValue(contents);
        currentFileHandle = fileHandle;
        tabContents[currentTabId] = contents;
    } catch (err) {
        console.error(err);
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

            tabContents[newId] = tabContents[activeTab.id];
            delete tabContents[activeTab.id];

            activeTab.id = newId;
            activeTab.textContent = newId;

            activeTab.appendChild(activeTab.querySelector('.close-tab'));
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

            tabContents[newId] = tabContents[activeTab.id];
            delete tabContents[activeTab.id];

            activeTab.id = newId;
            activeTab.textContent = newId;

            activeTab.appendChild(activeTab.querySelector('.close-tab'));
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

window.onload = () => {
    addTab('Untitled.txt');
    setTheme('light');
};
