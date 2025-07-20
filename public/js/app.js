// START GENAI
/**
 * Frontend JavaScript for the Children's Educational Video Content Generator
 */

// DOM Elements - Navigation
const generateLink = document.getElementById('generate-link');
const savedLink = document.getElementById('saved-link');
const generateContent = document.getElementById('generate-content');
const savedContent = document.getElementById('saved-content');

// DOM Elements - Logs (Generation Logs)
const logsContainer = document.getElementById('logsContainer');
const showMoreContainer = document.getElementById('showMoreContainer');
const showMoreBtn = document.getElementById('showMoreBtn');

// DOM Elements - Generations
const savedGenerationsList = document.getElementById('savedGenerationsList');
const loadingSavedGenerations = document.getElementById('LoadingSavedGenerations');
const noSavedGenerations = document.getElementById('noSavedGenerations');
const savedGenerationsContent = document.getElementById('savedGenerationsContent');

// DOM Elements - Modals
const saveGenerationModal = document.getElementById('saveGenerationModal');
const saveGenerationForm = document.getElementById('saveGenerationForm');
const confirmSaveBtn = document.getElementById('confirmSaveBtn');
const viewGenerationModal = document.getElementById('viewGenerationModal');
const viewGenerationModalLabel = document.getElementById('viewGenerationModalLabel');
const generationContent = document.getElementById('generationContent');

// DOM Elements - Theme Selection
const existingThemeOption = document.getElementById('existingThemeOption');
const newThemeOption = document.getElementById('newThemeOption');
const existingThemeContainer = document.getElementById('existingThemeContainer');
const newThemeContainer = document.getElementById('newThemeContainer');
const existingThemeSelect = document.getElementById('existingThemeSelect');
const newThemeInput = document.getElementById('newThemeInput');

// DOM Elements - Save Button
const saveBtn = document.getElementById('saveBtn');
const loadingSpinner = document.getElementById('loadingSpinner');

// DOM Elements - Results Section
const resultsSection = document.getElementById('resultsSection');
const generationForm = document.getElementById('generationForm');
const copyToast = document.getElementById('copyToast');

// DOM Elements for Song Generation
const songGenerateLink = document.getElementById('song-generate-link');
const songGenerateContent = document.getElementById('song-generate-content');
const songGenerationForm = document.getElementById('songGenerationForm');
const songResultsSection = document.getElementById('songResultsSection');
const songResultsContainer = document.getElementById('songResultsContainer');
const songErrorAlert = document.getElementById('songErrorAlert');
const songErrorMessage = document.getElementById('songErrorMessage');
const songLoadingSpinner = document.getElementById('songLoadingSpinner');

// Bootstrap instances
const toast = new window.bootstrap.Toast(copyToast);
const saveModal = new window.bootstrap.Modal(saveGenerationModal);
const viewModal = new window.bootstrap.Modal(viewGenerationModal);

// Store the generated content and active SSE connection
let generatedContent = null;
let logEventSource = null;
let songVideoLogEventSource = null;

/**
 * Connect to the SSE log stream for song video generation
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToSongVideoLogStream(requestId) {
    // Close any existing connection
    if (songVideoLogEventSource) {
        console.log('Closing existing song video log stream connection');
        songVideoLogEventSource.close();
    }

    console.log(`Connecting to song video log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    songVideoLogEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    songVideoLogEventSource.onopen = () => {
        console.log('Song video log stream connection established');
        if (songResultsContainer && songResultsContainer.querySelector('.list-group')) {
            songResultsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    songVideoLogEventSource.onmessage = (event) => {
        console.log('Received song video SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to song video log stream');
            } else if (data.type === 'log') {
                console.log('Received song video log:', data.log, 'timestamp:', data.timestamp);
                if (songResultsContainer && songResultsContainer.querySelector('.alert-info')) {
                    songResultsContainer.innerHTML = '';
                }
                appendSongVideoLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Song video generation complete:', data.message);
                appendSongVideoLogEntry(data.message, data.timestamp);
                if (songLoadingSpinner) songLoadingSpinner.classList.add('d-none');
                setTimeout(() => {
                    if (songVideoLogEventSource) {
                        console.log('Closing song video log stream connection after completion');
                        songVideoLogEventSource.close();
                        songVideoLogEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown song video message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing song video SSE message:', error, event.data);
        }
    };

    // Handle errors
    songVideoLogEventSource.onerror = (error) => {
        console.error('Song video log stream error:', error);
        if (songResultsContainer && songResultsContainer.querySelector('.alert-info')) {
            songResultsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        if (songLoadingSpinner) songLoadingSpinner.classList.add('d-none');
        songVideoLogEventSource.close();
        songVideoLogEventSource = null;
    };
}

/**
 * Append a single log entry to the song video display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendSongVideoLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending song video log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    if (songResultsSection) songResultsSection.classList.remove('d-none');

    // Create the log item list if it doesn't exist yet
    if (!songResultsContainer.querySelector('.list-group')) {
        console.log('Creating new song video log list');
        const logList = document.createElement('div');
        logList.className = 'list-group';
        songResultsContainer.appendChild(logList);
    }

    const logList = songResultsContainer.querySelector('.list-group');

    // Create and append the new log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item';

    if (timestamp) {
        logItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <p class="mb-0">${log}</p>
        <small class="text-muted ms-2">${timestamp}</small>
      </div>
    `;
    } else {
        logItem.innerHTML = `<p class="mb-0">${log}</p>`;
    }

    logList.appendChild(logItem);

    // Scroll to the bottom
    songResultsContainer.scrollTop = songResultsContainer.scrollHeight;
}

/**
 * Connect to the SSE log stream
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToLogStream(requestId) {
    // Close any existing connection
    if (logEventSource) {
        console.log('Closing existing log stream connection');
        logEventSource.close();
    }

    console.log(`Connecting to log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    logEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    logEventSource.onopen = () => {
        console.log('Log stream connection established');
        if (logsContainer.querySelector('.list-group')) {
            logsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    logEventSource.onmessage = (event) => {
        console.log('Received SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to log stream');
            } else if (data.type === 'log') {
                console.log('Received log:', data.log, 'timestamp:', data.timestamp);
                if (logsContainer.querySelector('.alert-info')) {
                    logsContainer.innerHTML = '';
                }
                appendLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Content generation complete:', data.message);
                appendLogEntry(data.message, data.timestamp);
                setLoadingState(false); // <-- Re-enable button here
                setTimeout(() => {
                    if (logEventSource) {
                        console.log('Closing log stream connection after completion');
                        logEventSource.close();
                        logEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing SSE message:', error, event.data);
        }
    };

    // Handle errors
    logEventSource.onerror = (error) => {
        console.error('Log stream error:', error);
        if (logsContainer.querySelector('.alert-info')) {
            logsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        setLoadingState(false); // <-- Also re-enable on error
        logEventSource.close();
        logEventSource = null;
    };
}

/**
 * Append a single log entry to the display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    resultsSection.classList.remove('d-none');

    // Create the log item list if it doesn't exist yet
    if (!logsContainer.querySelector('.list-group')) {
        console.log('Creating new log list');
        const logList = document.createElement('div');
        logList.className = 'list-group';
        logsContainer.appendChild(logList);
    }

    const logList = logsContainer.querySelector('.list-group');

    // Create and append the new log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item';

    if (timestamp) {
        logItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <p class="mb-0">${log}</p>
        <small class="text-muted ms-2">${timestamp}</small>
      </div>
    `;
    } else {
        logItem.innerHTML = `<p class="mb-0">${log}</p>`;
    }

    logList.appendChild(logItem);

    // Scroll to the bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

/**
 * Handle form submission
 */
if (generationForm) {
    generationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const topicsJsonElem = document.getElementById('topicsJson');
        const topicsJsonText = topicsJsonElem && topicsJsonElem.value ? topicsJsonElem.value.trim() : '';
        if (!topicsJsonText) {
            showError('Please enter topics JSON');
            return;
        }

        // Parse and validate JSON input
        let topics;
        try {
            topics = JSON.parse(topicsJsonText);

            if (typeof topics !== 'object' || Array.isArray(topics)) {
                throw new Error('Topics must be an object with theme keys and topic arrays');
            }

            for (const theme in topics) {
                if (!Array.isArray(topics[theme])) {
                    throw new Error(`Topics for theme "${theme}" must be an array`);
                }
            }
        } catch (error) {
            showError(`Invalid JSON format: ${error.message}`);
            return;
        }

        // Prepare UI
        setLoadingState(true);
        hideError();
        hideResults();
        logsContainer.innerHTML = '';
        resultsSection.classList.remove('d-none');
        logsContainer.innerHTML = `<div class="alert alert-info">Waiting for logs...</div>`;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topics })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'An error occurred during content generation');
            }

            if (data.requestId) {
                console.log('Received requestId:', data.requestId);

                logsContainer.innerHTML = '';
                connectToLogStream(data.requestId);

                appendLogEntry('Content generation started: You will see logs in real-time as they are generated.');

                // Fallback message if logs are delayed
                setTimeout(() => {
                    const logGroup = logsContainer.querySelector('.list-group');
                    if (!logGroup || logGroup.children.length <= 1) {
                        console.log('No logs received via SSE yet, adding a status message');
                        appendLogEntry('Waiting for logs. This may take a moment.');
                    }
                }, 3000);
            }

        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred during content generation');
            logsContainer.innerHTML = '';
        } finally {
            // setLoadingState(false); // <-- Remove this line so button is only re-enabled on log stream completion
        }
    });
}

/**
 * Fetch existing themes from the server
 */
async function fetchThemes() {
    try {
        const response = await fetch('/api/themes');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred while fetching themes');
        }

        return data.themes;
    } catch (error) {
        console.error('Error fetching themes:', error);
        return [];
    }
}

/**
 * Populate the theme dropdown with fetched themes
 */
async function populateThemeDropdown() {
    const themeSelect = document.getElementById('existingThemeSelect');

    // Clear existing options except the placeholder
    while (themeSelect.options.length > 1) {
        themeSelect.remove(1);
    }

    // Set loading state
    themeSelect.options[0].text = 'Loading themes...';

    // Fetch themes
    const themes = await fetchThemes();

    // Update UI based on result
    if (themes.length === 0) {
        themeSelect.options[0].text = 'No existing themes';
        var newThemeOptionElem = document.getElementById('newThemeOption');
        var existingThemeOptionElem = document.getElementById('existingThemeOption');
        var newThemeContainerElem = document.getElementById('newThemeContainer');
        var existingThemeContainerElem = document.getElementById('existingThemeContainer');
        if (newThemeOptionElem) newThemeOptionElem.checked = true;
        if (existingThemeOptionElem) existingThemeOptionElem.disabled = true;
        if (newThemeContainerElem) newThemeContainerElem.classList.remove('d-none');
        if (existingThemeContainerElem) existingThemeContainerElem.classList.add('d-none');
    } else {
        themeSelect.options[0].text = 'Select a theme';
        var existingThemeOptionElem = document.getElementById('existingThemeOption');
        if (existingThemeOptionElem) existingThemeOptionElem.disabled = false;

        themes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.text = theme;
            themeSelect.appendChild(option);
        });
    }
}

/**
 * Handle confirm save button click
 */
if (confirmSaveBtn) {
    confirmSaveBtn.addEventListener('click', async () => {
        if (!generatedContent) return;

        let theme = '';

        // Get theme based on selected option
        var existingThemeOptionElem = document.getElementById('existingThemeOption');
        if (existingThemeOptionElem && existingThemeOptionElem.checked) {
            var existingThemeSelectElem = document.getElementById('existingThemeSelect');
            theme = existingThemeSelectElem && existingThemeSelectElem.value ? existingThemeSelectElem.value : '';
            if (!theme) {
                alert('Please select a theme');
                return;
            }
        } else {
            var newThemeInputElem = document.getElementById('newThemeInput');
            theme = newThemeInputElem && newThemeInputElem.value ? newThemeInputElem.value.trim() : '';
            if (!theme) {
                alert('Please enter a theme name');
                return;
            }
        }

        try {
            const response = await fetch('/api/save-generation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theme,
                    topic: generatedContent.topic,
                    content: generatedContent.data
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to save generation');
            }

            // Hide modal
            saveModal.hide();

            // Show success message
            alert('Generation saved successfully!');

            // Reload saved list if already viewing
            if (savedLink && savedLink.classList.contains('active')) {
                loadSavedGenerations();
            }

        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'An error occurred while saving the generation');
        }
    });
}

/**
 * Event listeners for sidebar navigation
 */
if (savedLink) {
    savedLink.addEventListener('click', (e) => {
        e.preventDefault();
        savedLink.classList.add('active');
        if (generateLink) generateLink.classList.remove('active');
        if (songGenerateLink) songGenerateLink.classList.remove('active');
        if (generateContent) generateContent.classList.add('d-none');
        if (resultsSection) resultsSection.classList.add('d-none');
        if (songGenerateContent) songGenerateContent.classList.add('d-none');
        if (songResultsSection) songResultsSection.classList.add('d-none');
        if (songErrorAlert) songErrorAlert.classList.add('d-none');
        if (savedContent) savedContent.classList.remove('d-none');
        if (typeof loadSavedGenerations === 'function') {
            loadSavedGenerations();
        }
    });
}

if (generateLink) {
    generateLink.addEventListener('click', (e) => {
        e.preventDefault();
        generateLink.classList.add('active');
        if (savedLink) savedLink.classList.remove('active');
        if (songGenerateLink) songGenerateLink.classList.remove('active');
        if (generateContent) generateContent.classList.remove('d-none');
        if (savedContent) savedContent.classList.add('d-none');
        if (songGenerateContent) songGenerateContent.classList.add('d-none');
        if (songResultsSection) songResultsSection.classList.add('d-none');
        if (songErrorAlert) songErrorAlert.classList.add('d-none');
        if (resultsSection) resultsSection.classList.remove('d-none');
    });
}

if (songGenerateLink) {
    songGenerateLink.addEventListener('click', (e) => {
        e.preventDefault();
        songGenerateLink.classList.add('active');
        if (generateLink) generateLink.classList.remove('active');
        if (savedLink) savedLink.classList.remove('active');
        if (generateContent) generateContent.classList.add('d-none');
        if (savedContent) savedContent.classList.add('d-none');
        if (resultsSection) resultsSection.classList.add('d-none');
        if (songGenerateContent) songGenerateContent.classList.remove('d-none');
        if (songResultsSection) songResultsSection.classList.add('d-none');
        if (songErrorAlert) songErrorAlert.classList.add('d-none');
    });
}

if (songGenerationForm) {
    songGenerationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (songErrorAlert) songErrorAlert.classList.add('d-none');
        if (songResultsSection) songResultsSection.classList.add('d-none');
        if (songResultsContainer) songResultsContainer.innerHTML = '';
        if (songLoadingSpinner) songLoadingSpinner.classList.remove('d-none');
        const songsJsonElem = document.getElementById('songsJson');
        const songsJsonText = songsJsonElem && songsJsonElem.value ? songsJsonElem.value.trim() : '';
        if (!songsJsonText) {
            if (songErrorAlert && songErrorMessage) {
                songErrorMessage.textContent = 'Please enter Songs JSON';
                songErrorAlert.classList.remove('d-none');
            }
            if (songLoadingSpinner) songLoadingSpinner.classList.add('d-none');
            return;
        }
        let songs;
        try {
            songs = JSON.parse(songsJsonText);
            if (!Array.isArray(songs)) throw new Error('Songs must be an array of objects');
            for (const song of songs) {
                if (typeof song !== 'object' || Array.isArray(song)) throw new Error('Each song must be an object');
                if (typeof song.topic !== 'string' || !song.topic.trim()) throw new Error('Each song must have a non-empty topic');
                if (!Array.isArray(song.segments)) throw new Error('Each song must have a segments array');
                for (const seg of song.segments) {
                    if (typeof seg !== 'object' || !seg.duration || !seg.content) throw new Error('Each segment must have "duration" and "content"');
                    if (typeof seg.duration !== 'number' || (seg.duration !== 6 && seg.duration !== 10)) throw new Error('Each segment duration must be 6 or 10 seconds');
                }
            }
        } catch (error) {
            if (songErrorAlert && songErrorMessage) {
                songErrorMessage.textContent = `Invalid JSON format: ${error.message}`;
                songErrorAlert.classList.remove('d-none');
            }
            if (songLoadingSpinner) songLoadingSpinner.classList.add('d-none');
            return;
        }
        try {
            const response = await fetch('/api/generate-song-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: songs })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'An error occurred during song video generation');
            }

            if (data.requestId) {
                console.log('Received requestId for song video generation:', data.requestId);

                // Clear previous results and show results section
                if (songResultsContainer) songResultsContainer.innerHTML = '';
                if (songResultsSection) songResultsSection.classList.remove('d-none');
                
                // Connect to log stream for song video generation
                connectToSongVideoLogStream(data.requestId);

                // Add initial message
                appendSongVideoLogEntry('Song video generation started: You will see logs in real-time as they are generated.');

                // Fallback message if logs are delayed
                setTimeout(() => {
                    const logGroup = songResultsContainer.querySelector('.list-group');
                    if (!logGroup || logGroup.children.length <= 1) {
                        console.log('No logs received via SSE yet for song video, adding a status message');
                        appendSongVideoLogEntry('Waiting for logs. This may take a moment.');
                    }
                }, 3000);
            } else {
                throw new Error('No requestId received from server');
            }
        } catch (error) {
            if (songErrorAlert && songErrorMessage) {
                songErrorMessage.textContent = error.message || 'An error occurred during song video generation';
                songErrorAlert.classList.remove('d-none');
            }
            if (songLoadingSpinner) songLoadingSpinner.classList.add('d-none');
        }
    });
}

/**
 * Set the loading state
 */
function setLoadingState(isLoading) {
    var generateBtn = document.getElementById('generateBtn');
    var loadingSpinner = document.getElementById('loadingSpinner');
    if (!generateBtn || !loadingSpinner) return;
    if (isLoading) {
        generateBtn.disabled = true;
        loadingSpinner.classList.remove('d-none');
        generateBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Generating...
    `;
    } else {
        generateBtn.disabled = false;
        loadingSpinner.classList.add('d-none');
        generateBtn.innerHTML = 'Generate Content';
    }
}

/**
 * Show an error message
 */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorAlert = document.getElementById('errorAlert');
    if (errorMessage && errorAlert) {
        errorMessage.textContent = message;
        errorAlert.classList.remove('d-none');
    }
}

/**
 * Hide the error message
 */
function hideError() {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
        errorAlert.classList.add('d-none');
    }
}

/**
 * Hide the results section
 */
function hideResults() {
    resultsSection.classList.add('d-none');
}

/**
 * Format the content based on the selected output format
 */
function formatContent(data, format) {
    // Create a copy of the data without the 'media' key
    const filteredData = { ...data };
    delete filteredData.media;

    switch (format) {
        case 'json':
            return JSON.stringify(filteredData, null, 2);
        case 'yaml':
            return Object.entries(filteredData)
                .map(([key, value]) => {
                    if (typeof value === 'object' && value !== null) {
                        return `${key}:\n  ${JSON.stringify(value, null, 2).replace(/\n/g, '\n  ')}`;
                    }
                    return `${key}: ${value}`;
                })
                .join('\n');
        case 'text':
        default:
            return Object.entries(filteredData)
                .map(([key, value]) => {
                    const header = `=== ${key.toUpperCase()} ===`;
                    if (typeof value === 'object' && value !== null) {
                        return `${header}\n${JSON.stringify(value, null, 2)}`;
                    }
                    return `${header}\n${value}`;
                })
                .join('\n\n');
    }
}

/**
 * Handle show more button click
 */
if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
        const logItems = logsContainer.querySelectorAll('.list-group-item');
        logItems.forEach(item => item.classList.remove('d-none'));
        showMoreContainer.classList.add('d-none');
    });
}

/**
 * Save button - open modal and prefill
 */
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        if (!generatedContent) return;

        // Pre-fill the new theme input with the first word of topic if available
        if (generatedContent && generatedContent.topic) {
            var newThemeInputElem = document.getElementById('newThemeInput');
            const topicParts = generatedContent.topic.split(' ');
            if (topicParts.length > 0 && newThemeInputElem) {
                newThemeInputElem.value = topicParts[0];
            }
        }

        // Populate dropdown
        await populateThemeDropdown();

        // Show modal
        saveModal.show();
    });
}

/**
 * Theme option toggle
 */
if (existingThemeOption) {
    existingThemeOption.addEventListener('change', function() {
        var existingThemeOptionElem = document.getElementById('existingThemeOption');
        var existingThemeContainerElem = document.getElementById('existingThemeContainer');
        var newThemeContainerElem = document.getElementById('newThemeContainer');
        if (existingThemeOptionElem && existingThemeOptionElem.checked) {
            if (existingThemeContainerElem) existingThemeContainerElem.classList.remove('d-none');
            if (newThemeContainerElem) newThemeContainerElem.classList.add('d-none');
        }
    });
}

if (newThemeOption) {
    newThemeOption.addEventListener('change', function() {
        var newThemeOptionElem = document.getElementById('newThemeOption');
        var newThemeContainerElem = document.getElementById('newThemeContainer');
        var existingThemeContainerElem = document.getElementById('existingThemeContainer');
        if (newThemeOptionElem && newThemeOptionElem.checked) {
            if (newThemeContainerElem) newThemeContainerElem.classList.remove('d-none');
            if (existingThemeContainerElem) existingThemeContainerElem.classList.add('d-none');
        }
    });
}

/**
 * Load saved generations with retry logic
 * @param {number} retryCount - Number of retries attempted (default: 0)
 * @param {number} maxRetries - Maximum number of retries (default: 5)
 * @param {number} retryDelay - Delay between retries in ms (default: 2000)
 */
async function loadSavedGenerations(retryCount = 0, maxRetries = 5, retryDelay = 2000) {
    // Show loading state
    var loadingSavedGenerations = document.getElementById('loadingSavedGenerations');
    var noSavedGenerations = document.getElementById('noSavedGenerations');
    var savedGenerationsContent = document.getElementById('savedGenerationsContent');
    if (loadingSavedGenerations) loadingSavedGenerations.classList.remove('d-none');
    if (noSavedGenerations) noSavedGenerations.classList.add('d-none');
    if (savedGenerationsContent) savedGenerationsContent.classList.add('d-none');

    try {
        const response = await fetch('/api/unprocessed');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred while loading generations');
        }

        if (!data.success || !Array.isArray(data.generations)) {
            throw new Error('Failed to load generations');
        }

        // Display the saved generations
        displaySavedGenerations(data.generations);
    } catch (error) {
        console.error(`Error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);

        if (
            (error.message.includes('Failed to fetch') ||
                error.message.includes('NetworkError') ||
                error.message.includes('ERR_CONNECTION_REFUSED')) &&
            retryCount < maxRetries
        ) {
            console.log(`Retrying in ${retryDelay}ms...`);
            loadingSavedGenerations.innerHTML = `
        <div class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Connection failed. Retrying... (${retryCount + 1}/${maxRetries})</p>
        </div>
      `;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return loadSavedGenerations(retryCount + 1, maxRetries, retryDelay * 1.5);
        }

        alert(error.message || 'An error occurred while loading generations');
    } finally {
        // Reset loading state
        loadingSavedGenerations.innerHTML = `
      <div class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading generations...</p>
      </div>
    `;
        loadingSavedGenerations.classList.add('d-none');
    }
}

/**
 * Display generations
 */
function displaySavedGenerations(generations) {
    const savedGenerationsContent = document.getElementById('savedGenerationsContent');
    const noSavedGenerations = document.getElementById('noSavedGenerations');
    if (!savedGenerationsContent) return;
    savedGenerationsContent.innerHTML = '';

    if (!generations.length) {
        if (noSavedGenerations) noSavedGenerations.classList.remove('d-none');
        savedGenerationsContent.classList.add('d-none');
        return;
    } else {
        if (noSavedGenerations) noSavedGenerations.classList.add('d-none');
        savedGenerationsContent.classList.remove('d-none');
    }

    // Sort generations by file number (ascending)
    generations.sort((a, b) => {
        const aMatch = a.filename.match(/^([0-9]+)-/);
        const bMatch = b.filename.match(/^([0-9]+)-/);
        const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
        const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
        return aNum - bNum;
    });

    const listGroup = document.createElement('div');
    listGroup.className = 'list-group';

    generations.forEach(gen => {
        // New filename format: 1-topic.json
        const match = gen.filename.match(/^([0-9]+)-([a-z0-9_]+)\.json$/);
        let number = '', topic = '';
        if (match) {
            number = match[1];
            topic = match[2].replace(/_/g, ' ');
        } else {
            // fallback: show filename
            topic = gen.filename;
        }

        const button = document.createElement('button');
        button.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center view-generation';
        button.dataset.filename = gen.filename;
        button.innerHTML = `
            <div>
                <h6 class="mb-1">#${number} - ${topic}</h6>
            </div>
            <span class="badge bg-primary rounded-pill">View</span>
        `;
        listGroup.appendChild(button);
    });

    savedGenerationsContent.appendChild(listGroup);

    // Attach click event listeners to view-generation buttons
    listGroup.querySelectorAll('.view-generation').forEach(button => {
        button.addEventListener('click', async () => {
            const filename = button.getAttribute('data-filename');
            await viewGeneration(filename);
        });
    });
}

/**
 * View a specific generation with retry logic
 * @param {string} filename - The filename
 * @param {number} retryCount - Number of retries attempted (default: 0)
 * @param {number} maxRetries - Maximum number of retries (default: 5)
 * @param {number} retryDelay - Delay between retries in ms (default: 2000)
 */
async function viewGeneration(filename, retryCount = 0, maxRetries = 5, retryDelay = 2000) {
    try {
        // Show loading state in the modal
        generationContent.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading generation content...</p>
      </div>
    `;

        // Extract number from filename (e.g. "123-topic.json")
        const numberMatch = filename.match(/^(\d+)-/);
        const fileNumber = numberMatch ? numberMatch[1] : '';
        viewGenerationModalLabel.textContent = `Generation #${fileNumber}: ${filename}`;

        // Show the modal
        viewModal.show();

        // Fetch generation content
        const response = await fetch(`/api/unprocessed/${filename}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred while loading the generation');
        }

        if (!data.success) {
            throw new Error('Failed to load generation');
        }

        // Try parsing content as JSON
        try {
            const jsonContent = JSON.parse(data.content);
            generationContent.innerHTML = `<pre class="mb-0">${JSON.stringify(jsonContent, null, 2)}</pre>`;
        } catch (e) {
            // Fallback to plain text
            generationContent.innerHTML = `<pre class="mb-0">${data.content}</pre>`;
        }

    } catch (error) {
        console.error(`Error (attempt ${retryCount + 1}/${maxRetries}):`, error);

        const isRetryable =
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('ERR_CONNECTION_REFUSED');

        if (isRetryable && retryCount < maxRetries) {
            generationContent.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Connection failed. Retrying... (${retryCount + 1}/${maxRetries})</p>
        </div>
      `;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return viewGeneration(filename, retryCount + 1, maxRetries, retryDelay * 1.5);
        }

        generationContent.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${error.message || 'An error occurred while loading the generation'}
      </div>
    `;
    }
}

/**
 * Check server status on page load with retry logic
 * @param {number} retryCount - Number of retries attempted (default: 0)
 * @param {number} maxRetries - Maximum number of retries (default: 5)
 * @param {number} retryDelay - Delay between retries in ms (default: 2000)
 * @returns {Promise<boolean>} True if server is ready, false otherwise
 */
async function checkServerStatus(retryCount = 0, maxRetries = 5, retryDelay = 2000) {
    try {
        console.log(`Checking server status (attempt ${retryCount + 1}/${maxRetries + 1})...`);
        showError(`Connecting to server... (attempt ${retryCount + 1}/${maxRetries + 1})`);

        const response = await fetch('/api/status');
        const data = await response.json();

        if (data.status !== 'ok') {
            showError('Server is not responding correctly. Please try again later.');
            return false;
        } else {
            hideError();
            console.log('Server is ready!');
            return true;
        }
    } catch (error) {
        console.error(`Server status check failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);

        const isRetryable =
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('ERR_CONNECTION_REFUSED');

        if (isRetryable && retryCount < maxRetries) {
            console.log(`Retrying server status check in ${retryDelay}ms...`);
            showError(`Connecting to server... (attempt ${retryCount + 2}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return checkServerStatus(retryCount + 1, maxRetries, retryDelay * 1.5);
        }

        showError('Cannot connect to the server. Please ensure the server is running.');
        return false;
    }
}