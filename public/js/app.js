// START GENAI
/**
 * Frontend JavaScript for the Educational Promt Content Generator
 */

// DOM Elements - Navigation
const savedLink = document.getElementById('saved-link');
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
const copyToast = document.getElementById('copyToast');

// DOM Elements for Halloween Patchwork Generation
const halloweenPatchworkLink = document.getElementById('halloween-patchwork-link');
const halloweenPatchworkContent = document.getElementById('halloween-patchwork-content');
const halloweenPatchworkForm = document.getElementById('halloweenPatchworkForm');
const halloweenPatchworkGroupFrames = document.getElementById('halloweenPatchworkGroupFrames');
const halloweenPatchworkResultsSection = document.getElementById('halloweenPatchworkResultsSection');
const halloweenPatchworkResultsContainer = document.getElementById('halloweenPatchworkResultsContainer');
const halloweenPatchworkErrorAlert = document.getElementById('halloweenPatchworkErrorAlert');
const halloweenPatchworkErrorMessage = document.getElementById('halloweenPatchworkErrorMessage');
const halloweenPatchworkLoadingSpinner = document.getElementById('halloweenPatchworkLoadingSpinner');

// DOM Elements for Halloween Generation
const halloweenLink = document.getElementById('halloween-link');
const halloweenContent = document.getElementById('halloween-content');
const halloweenForm = document.getElementById('halloweenForm');
const halloweenGroupFrames = document.getElementById('halloweenGroupFrames');
const halloweenResultsSection = document.getElementById('halloweenResultsSection');
const halloweenResultsContainer = document.getElementById('halloweenResultsContainer');
const halloweenErrorAlert = document.getElementById('halloweenErrorAlert');
const halloweenErrorMessage = document.getElementById('halloweenErrorMessage');
const halloweenLoadingSpinner = document.getElementById('halloweenLoadingSpinner');

// DOM Elements for Halloween Transform Generation
const halloweenTransformLink = document.getElementById('halloween-transform-link');
const halloweenTransformContent = document.getElementById('halloween-transform-content');
const halloweenTransformForm = document.getElementById('halloweenTransformForm');
const halloweenTransformGroupFrames = document.getElementById('halloweenTransformGroupFrames');
const halloweenTransformResultsSection = document.getElementById('halloweenTransformResultsSection');
const halloweenTransformResultsContainer = document.getElementById('halloweenTransformResultsContainer');
const halloweenTransformErrorAlert = document.getElementById('halloweenTransformErrorAlert');
const halloweenTransformErrorMessage = document.getElementById('halloweenTransformErrorMessage');
const halloweenTransformLoadingSpinner = document.getElementById('halloweenTransformLoadingSpinner');

// DOM Elements for Halloween Transform Two Frame Generation
const halloweenTransformTwoFrameLink = document.getElementById('halloween-transform-two-frame-link');
const halloweenTransformTwoFrameContent = document.getElementById('halloween-transform-two-frame-content');
const halloweenTransformTwoFrameForm = document.getElementById('halloweenTransformTwoFrameForm');
const halloweenTransformTwoFrameGroupFrames = document.getElementById('halloweenTransformTwoFrameGroupFrames');
const halloweenTransformTwoFrameResultsSection = document.getElementById('halloweenTransformTwoFrameResultsSection');
const halloweenTransformTwoFrameResultsContainer = document.getElementById('halloweenTransformTwoFrameResultsContainer');
const halloweenTransformTwoFrameErrorAlert = document.getElementById('halloweenTransformTwoFrameErrorAlert');
const halloweenTransformTwoFrameErrorMessage = document.getElementById('halloweenTransformTwoFrameErrorMessage');
const halloweenTransformTwoFrameLoadingSpinner = document.getElementById('halloweenTransformTwoFrameLoadingSpinner');

// DOM Elements for Poems Generation
const poemsLink = document.getElementById('poems-link');
const poemsContent = document.getElementById('poems-content');
const poemsForm = document.getElementById('poemsForm');
const poemsLyrics = document.getElementById('poemsLyrics');
const poemsLinesPerVideo = document.getElementById('poemsLinesPerVideo');
const poemsResultsSection = document.getElementById('poemsResultsSection');
const poemsResultsContainer = document.getElementById('poemsResultsContainer');
const poemsErrorAlert = document.getElementById('poemsErrorAlert');
const poemsErrorMessage = document.getElementById('poemsErrorMessage');
const poemsLoadingSpinner = document.getElementById('poemsLoadingSpinner');

// DOM Elements for Poems Direct Video Generation
const poemsDirectVideoLink = document.getElementById('poems-direct-video-link');
const poemsDirectVideoContent = document.getElementById('poems-direct-video-content');
const poemsDirectVideoForm = document.getElementById('poemsDirectVideoForm');
const poemsDirectVideoLyrics = document.getElementById('poemsDirectVideoLyrics');
const poemsDirectVideoLinesPerVideo = document.getElementById('poemsDirectVideoLinesPerVideo');
const poemsDirectVideoResultsSection = document.getElementById('poemsDirectVideoResultsSection');
const poemsDirectVideoResultsContainer = document.getElementById('poemsDirectVideoResultsContainer');
const poemsDirectVideoErrorAlert = document.getElementById('poemsDirectVideoErrorAlert');
const poemsDirectVideoErrorMessage = document.getElementById('poemsDirectVideoErrorMessage');
const poemsDirectVideoLoadingSpinner = document.getElementById('poemsDirectVideoLoadingSpinner');



// Bootstrap instances
const toast = new window.bootstrap.Toast(copyToast);
const saveModal = new window.bootstrap.Modal(saveGenerationModal);
const viewModal = new window.bootstrap.Modal(viewGenerationModal);

// Store the generated content and active SSE connection
let generatedContent = null;
let logEventSource = null;
let halloweenPatchworkLogEventSource = null;
let halloweenLogEventSource = null;
let halloweenTransformLogEventSource = null;
let halloweenTransformTwoFrameLogEventSource = null;
let poemsLogEventSource = null;
let poemsDirectVideoLogEventSource = null;

/**
 * Connect to the SSE log stream for Halloween Patchwork generation
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToHalloweenPatchworkLogStream(requestId) {
    // Close any existing connection
    if (halloweenPatchworkLogEventSource) {
        console.log('Closing existing Halloween Patchwork log stream connection');
        halloweenPatchworkLogEventSource.close();
    }

    console.log(`Connecting to song with animals log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    halloweenPatchworkLogEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    halloweenPatchworkLogEventSource.onopen = () => {
        console.log('Halloween Patchwork log stream connection established');
        if (halloweenPatchworkResultsContainer && halloweenPatchworkResultsContainer.querySelector('.list-group')) {
            halloweenPatchworkResultsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    halloweenPatchworkLogEventSource.onmessage = (event) => {
        console.log('Received Halloween Patchwork SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to Halloween Patchwork log stream');
            } else if (data.type === 'log') {
                console.log('Received Halloween Patchwork log:', data.log, 'timestamp:', data.timestamp);
                if (halloweenPatchworkResultsContainer && halloweenPatchworkResultsContainer.querySelector('.alert-info')) {
                    halloweenPatchworkResultsContainer.innerHTML = '';
                }
                appendHalloweenPatchworkLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Halloween Patchwork generation complete:', data.message);
                appendHalloweenPatchworkLogEntry(data.message, data.timestamp);
                if (halloweenPatchworkLoadingSpinner) halloweenPatchworkLoadingSpinner.classList.add('d-none');
                setTimeout(() => {
                    if (halloweenPatchworkLogEventSource) {
                        console.log('Closing Halloween Patchwork log stream connection after completion');
                        halloweenPatchworkLogEventSource.close();
                        halloweenPatchworkLogEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown Halloween Patchwork message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing Halloween Patchwork SSE message:', error, event.data);
        }
    };

    // Handle errors
    halloweenPatchworkLogEventSource.onerror = (error) => {
        console.error('Halloween Patchwork log stream error:', error);
        if (halloweenPatchworkResultsContainer && halloweenPatchworkResultsContainer.querySelector('.alert-info')) {
            halloweenPatchworkResultsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        if (halloweenPatchworkLoadingSpinner) halloweenPatchworkLoadingSpinner.classList.add('d-none');
        halloweenPatchworkLogEventSource.close();
        halloweenPatchworkLogEventSource = null;
    };
}

/**
 * Append a single log entry to the Halloween Patchwork display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendHalloweenPatchworkLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending Halloween Patchwork log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.remove('d-none');

    // Create the log item list if it doesn't exist yet
    if (!halloweenPatchworkResultsContainer.querySelector('.list-group')) {
        console.log('Creating new Halloween Patchwork log list');
        const logList = document.createElement('div');
        logList.className = 'list-group';
        halloweenPatchworkResultsContainer.appendChild(logList);
    }

    const logList = halloweenPatchworkResultsContainer.querySelector('.list-group');

    // Create and append the new log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item';

    if (timestamp) {
        let formattedTime;
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString();
            } else {
                formattedTime = timestamp;
            }
        } catch (e) {
            formattedTime = timestamp;
        }
        logItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <p class="mb-0">${log}</p>
        <small class="text-muted ms-2">${formattedTime}</small>
      </div>
    `;
    } else {
        logItem.innerHTML = `<p class="mb-0">${log}</p>`;
    }

    logList.appendChild(logItem);

    // Scroll to the bottom
    halloweenPatchworkResultsContainer.scrollTop = halloweenPatchworkResultsContainer.scrollHeight;
}

/**
 * Connect to the SSE log stream for Halloween generation
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToHalloweenLogStream(requestId) {
    // Close any existing connection
    if (halloweenLogEventSource) {
        console.log('Closing existing Halloween log stream connection');
        halloweenLogEventSource.close();
    }

    console.log(`Connecting to Halloween log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    halloweenLogEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    halloweenLogEventSource.onopen = () => {
        console.log('Halloween log stream connection established');
        if (halloweenResultsContainer && halloweenResultsContainer.querySelector('.list-group')) {
            halloweenResultsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    halloweenLogEventSource.onmessage = (event) => {
        console.log('Received Halloween SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to Halloween log stream');
            } else if (data.type === 'log') {
                console.log('Received Halloween log:', data.log, 'timestamp:', data.timestamp);
                if (halloweenResultsContainer && halloweenResultsContainer.querySelector('.alert-info')) {
                    halloweenResultsContainer.innerHTML = '';
                }
                appendHalloweenLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Halloween generation complete:', data.message);
                appendHalloweenLogEntry(data.message, data.timestamp);
                if (halloweenLoadingSpinner) halloweenLoadingSpinner.classList.add('d-none');
                setTimeout(() => {
                    if (halloweenLogEventSource) {
                        console.log('Closing Halloween log stream connection after completion');
                        halloweenLogEventSource.close();
                        halloweenLogEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown Halloween message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing Halloween SSE message:', error, event.data);
        }
    };

    // Handle errors
    halloweenLogEventSource.onerror = (error) => {
        console.error('Halloween log stream error:', error);
        if (halloweenResultsContainer && halloweenResultsContainer.querySelector('.alert-info')) {
            halloweenResultsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        if (halloweenLoadingSpinner) halloweenLoadingSpinner.classList.add('d-none');
        halloweenLogEventSource.close();
        halloweenLogEventSource = null;
    };
}

/**
 * Append a single log entry to the Halloween display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendHalloweenLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending Halloween log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    if (halloweenResultsSection) {
        halloweenResultsSection.classList.remove('d-none');
    }

    // Create or get the log list
    let logList = halloweenResultsContainer.querySelector('.list-group');
    if (!logList) {
        logList = document.createElement('div');
        logList.className = 'list-group';
        halloweenResultsContainer.appendChild(logList);
    }

    // Create log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item list-group-item-action';
    
    let formattedTime = '';
    if (timestamp) {
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString();
            } else {
                formattedTime = timestamp;
            }
        } catch (e) {
            formattedTime = timestamp;
        }
    }
    
    logItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${log}</h6>
            <small class="text-muted">${formattedTime}</small>
        </div>
    `;

    logList.appendChild(logItem);

    // Scroll to the bottom
    halloweenResultsContainer.scrollTop = halloweenResultsContainer.scrollHeight;
}

/**
 * Connect to the SSE log stream for Halloween Transform generation
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToHalloweenTransformLogStream(requestId) {
    // Close any existing connection
    if (halloweenTransformLogEventSource) {
        console.log('Closing existing Halloween Transform log stream connection');
        halloweenTransformLogEventSource.close();
    }

    console.log(`Connecting to Halloween Transform log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    halloweenTransformLogEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    halloweenTransformLogEventSource.onopen = () => {
        console.log('Halloween Transform log stream connection established');
        if (halloweenTransformResultsContainer && halloweenTransformResultsContainer.querySelector('.list-group')) {
            halloweenTransformResultsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    halloweenTransformLogEventSource.onmessage = (event) => {
        console.log('Received Halloween Transform SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to Halloween Transform log stream');
            } else if (data.type === 'log') {
                console.log('Received Halloween Transform log:', data.log, 'timestamp:', data.timestamp);
                if (halloweenTransformResultsContainer && halloweenTransformResultsContainer.querySelector('.alert-info')) {
                    halloweenTransformResultsContainer.innerHTML = '';
                }
                appendHalloweenTransformLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Halloween Transform generation complete:', data.message);
                appendHalloweenTransformLogEntry(data.message, data.timestamp);
                if (halloweenTransformLoadingSpinner) halloweenTransformLoadingSpinner.classList.add('d-none');
                setTimeout(() => {
                    if (halloweenTransformLogEventSource) {
                        console.log('Closing Halloween Transform log stream connection after completion');
                        halloweenTransformLogEventSource.close();
                        halloweenTransformLogEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown Halloween Transform message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing Halloween Transform SSE message:', error, event.data);
        }
    };

    // Handle errors
    halloweenTransformLogEventSource.onerror = (error) => {
        console.error('Halloween Transform log stream error:', error);
        if (halloweenTransformResultsContainer && halloweenTransformResultsContainer.querySelector('.alert-info')) {
            halloweenTransformResultsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        if (halloweenTransformLoadingSpinner) halloweenTransformLoadingSpinner.classList.add('d-none');
        halloweenTransformLogEventSource.close();
        halloweenTransformLogEventSource = null;
    };
}

/**
 * Append a single log entry to the Halloween Transform display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendHalloweenTransformLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending Halloween Transform log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    if (halloweenTransformResultsSection) {
        halloweenTransformResultsSection.classList.remove('d-none');
    }

    // Create or get the log list
    let logList = halloweenTransformResultsContainer.querySelector('.list-group');
    if (!logList) {
        logList = document.createElement('div');
        logList.className = 'list-group';
        halloweenTransformResultsContainer.appendChild(logList);
    }

    // Create log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item list-group-item-action';
    
    let formattedTime = '';
    if (timestamp) {
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString();
            } else {
                formattedTime = timestamp;
            }
        } catch (e) {
            formattedTime = timestamp;
        }
    }
    
    logItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${log}</h6>
            <small class="text-muted">${formattedTime}</small>
        </div>
    `;

    logList.appendChild(logItem);

    // Scroll to the bottom
    halloweenTransformResultsContainer.scrollTop = halloweenTransformResultsContainer.scrollHeight;
}

/**
 * Connect to the SSE log stream for Halloween Transform Two Frame generation
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToHalloweenTransformTwoFrameLogStream(requestId) {
    // Close any existing connection
    if (halloweenTransformTwoFrameLogEventSource) {
        console.log('Closing existing Halloween Transform Two Frame log stream connection');
        halloweenTransformTwoFrameLogEventSource.close();
    }

    console.log(`Connecting to Halloween Transform Two Frame log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    halloweenTransformTwoFrameLogEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    halloweenTransformTwoFrameLogEventSource.onopen = () => {
        console.log('Halloween Transform Two Frame log stream connection established');
        if (halloweenTransformTwoFrameResultsContainer && halloweenTransformTwoFrameResultsContainer.querySelector('.list-group')) {
            halloweenTransformTwoFrameResultsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    halloweenTransformTwoFrameLogEventSource.onmessage = (event) => {
        console.log('Received Halloween Transform Two Frame SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to Halloween Transform Two Frame log stream');
            } else if (data.type === 'log') {
                console.log('Received Halloween Transform Two Frame log:', data.log, 'timestamp:', data.timestamp);
                if (halloweenTransformTwoFrameResultsContainer && halloweenTransformTwoFrameResultsContainer.querySelector('.alert-info')) {
                    halloweenTransformTwoFrameResultsContainer.innerHTML = '';
                }
                appendHalloweenTransformTwoFrameLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Halloween Transform Two Frame generation complete:', data.message);
                appendHalloweenTransformTwoFrameLogEntry(data.message, data.timestamp);
                if (halloweenTransformTwoFrameLoadingSpinner) halloweenTransformTwoFrameLoadingSpinner.classList.add('d-none');
                setTimeout(() => {
                    if (halloweenTransformTwoFrameLogEventSource) {
                        console.log('Closing Halloween Transform Two Frame log stream connection after completion');
                        halloweenTransformTwoFrameLogEventSource.close();
                        halloweenTransformTwoFrameLogEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown Halloween Transform Two Frame message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing Halloween Transform Two Frame SSE message:', error, event.data);
        }
    };

    // Handle errors
    halloweenTransformTwoFrameLogEventSource.onerror = (error) => {
        console.error('Halloween Transform Two Frame log stream error:', error);
        if (halloweenTransformTwoFrameResultsContainer && halloweenTransformTwoFrameResultsContainer.querySelector('.alert-info')) {
            halloweenTransformTwoFrameResultsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        if (halloweenTransformTwoFrameLoadingSpinner) halloweenTransformTwoFrameLoadingSpinner.classList.add('d-none');
        halloweenTransformTwoFrameLogEventSource.close();
        halloweenTransformTwoFrameLogEventSource = null;
    };
}

/**
 * Append a single log entry to the Halloween Transform Two Frame display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendHalloweenTransformTwoFrameLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending Halloween Transform Two Frame log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    if (halloweenTransformTwoFrameResultsSection) {
        halloweenTransformTwoFrameResultsSection.classList.remove('d-none');
    }

    // Create or get the log list
    let logList = halloweenTransformTwoFrameResultsContainer.querySelector('.list-group');
    if (!logList) {
        logList = document.createElement('div');
        logList.className = 'list-group';
        halloweenTransformTwoFrameResultsContainer.appendChild(logList);
    }

    // Create log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item list-group-item-action';
    
    let formattedTime = '';
    if (timestamp) {
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString();
            } else {
                formattedTime = timestamp;
            }
        } catch (e) {
            formattedTime = timestamp;
        }
    }
    
    logItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${log}</h6>
            <small class="text-muted">${formattedTime}</small>
        </div>
    `;

    logList.appendChild(logItem);

    // Scroll to the bottom
    halloweenTransformTwoFrameResultsContainer.scrollTop = halloweenTransformTwoFrameResultsContainer.scrollHeight;
}

/**
 * Connect to the SSE log stream for Poems generation
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToPoemsLogStream(requestId) {
    // Close any existing connection
    if (poemsLogEventSource) {
        console.log('Closing existing Poems log stream connection');
        poemsLogEventSource.close();
    }

    console.log(`Connecting to Poems log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    poemsLogEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    poemsLogEventSource.onopen = () => {
        console.log('Poems log stream connection established');
        if (poemsResultsContainer && poemsResultsContainer.querySelector('.list-group')) {
            poemsResultsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    poemsLogEventSource.onmessage = (event) => {
        console.log('Received Poems SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to Poems log stream');
            } else if (data.type === 'log') {
                console.log('Received Poems log:', data.log, 'timestamp:', data.timestamp);
                if (poemsResultsContainer && poemsResultsContainer.querySelector('.alert-info')) {
                    poemsResultsContainer.innerHTML = '';
                }
                appendPoemsLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Poems generation complete:', data.message);
                appendPoemsLogEntry(data.message, data.timestamp);
                if (poemsLoadingSpinner) poemsLoadingSpinner.classList.add('d-none');
                setTimeout(() => {
                    if (poemsLogEventSource) {
                        console.log('Closing Poems log stream connection after completion');
                        poemsLogEventSource.close();
                        poemsLogEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown Poems message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing Poems SSE message:', error, event.data);
        }
    };

    // Handle errors
    poemsLogEventSource.onerror = (error) => {
        console.error('Poems log stream error:', error);
        if (poemsResultsContainer && poemsResultsContainer.querySelector('.alert-info')) {
            poemsResultsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        if (poemsLoadingSpinner) poemsLoadingSpinner.classList.add('d-none');
        poemsLogEventSource.close();
        poemsLogEventSource = null;
    };
}

/**
 * Append a single log entry to the Poems display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendPoemsLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending Poems log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    if (poemsResultsSection) {
        poemsResultsSection.classList.remove('d-none');
    }

    // Create or get the log list
    let logList = poemsResultsContainer.querySelector('.list-group');
    if (!logList) {
        logList = document.createElement('div');
        logList.className = 'list-group';
        poemsResultsContainer.appendChild(logList);
    }

    // Create log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item list-group-item-action';
    
    let formattedTime = '';
    if (timestamp) {
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString();
            } else {
                formattedTime = timestamp;
            }
        } catch (e) {
            formattedTime = timestamp;
        }
    }
    
    logItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${log}</h6>
            <small class="text-muted">${formattedTime}</small>
        </div>
    `;

    logList.appendChild(logItem);

    // Scroll to the bottom
    poemsResultsContainer.scrollTop = poemsResultsContainer.scrollHeight;
}

/**
 * Connect to the SSE log stream for Poems Direct Video generation
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToPoemsDirectVideoLogStream(requestId) {
    // Close any existing connection
    if (poemsDirectVideoLogEventSource) {
        console.log('Closing existing Poems Direct Video log stream connection');
        poemsDirectVideoLogEventSource.close();
    }

    console.log(`Connecting to Poems Direct Video log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    poemsDirectVideoLogEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    poemsDirectVideoLogEventSource.onopen = () => {
        console.log('Poems Direct Video log stream connection established');
        if (poemsDirectVideoResultsContainer && poemsDirectVideoResultsContainer.querySelector('.list-group')) {
            poemsDirectVideoResultsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    poemsDirectVideoLogEventSource.onmessage = (event) => {
        console.log('Received Poems Direct Video SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to Poems Direct Video log stream');
            } else if (data.type === 'log') {
                console.log('Received Poems Direct Video log:', data.log, 'timestamp:', data.timestamp);
                if (poemsDirectVideoResultsContainer && poemsDirectVideoResultsContainer.querySelector('.alert-info')) {
                    poemsDirectVideoResultsContainer.innerHTML = '';
                }
                appendPoemsDirectVideoLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Poems Direct Video generation complete:', data.message);
                appendPoemsDirectVideoLogEntry(data.message, data.timestamp);
                if (poemsDirectVideoLoadingSpinner) poemsDirectVideoLoadingSpinner.classList.add('d-none');
                setTimeout(() => {
                    if (poemsDirectVideoLogEventSource) {
                        console.log('Closing Poems Direct Video log stream connection after completion');
                        poemsDirectVideoLogEventSource.close();
                        poemsDirectVideoLogEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown Poems Direct Video message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing Poems Direct Video SSE message:', error, event.data);
        }
    };

    // Handle errors
    poemsDirectVideoLogEventSource.onerror = (error) => {
        console.error('Poems Direct Video log stream error:', error);
        if (poemsDirectVideoResultsContainer && poemsDirectVideoResultsContainer.querySelector('.alert-info')) {
            poemsDirectVideoResultsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        if (poemsDirectVideoLoadingSpinner) poemsDirectVideoLoadingSpinner.classList.add('d-none');
        poemsDirectVideoLogEventSource.close();
        poemsDirectVideoLogEventSource = null;
    };
}

/**
 * Append a single log entry to the Poems Direct Video display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendPoemsDirectVideoLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending Poems Direct Video log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    if (poemsDirectVideoResultsSection) {
        poemsDirectVideoResultsSection.classList.remove('d-none');
    }

    // Create or get the log list
    let logList = poemsDirectVideoResultsContainer.querySelector('.list-group');
    if (!logList) {
        logList = document.createElement('div');
        logList.className = 'list-group';
        poemsDirectVideoResultsContainer.appendChild(logList);
    }

    // Create log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item list-group-item-action';
    
    let formattedTime = '';
    if (timestamp) {
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString();
            } else {
                formattedTime = timestamp;
            }
        } catch (e) {
            formattedTime = timestamp;
        }
    }
    
    logItem.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${log}</h6>
            <small class="text-muted">${formattedTime}</small>
        </div>
    `;

    logList.appendChild(logItem);

    // Scroll to the bottom
    poemsDirectVideoResultsContainer.scrollTop = poemsDirectVideoResultsContainer.scrollHeight;
}

/**
 * Connect to the SSE log stream for short study generation
 * @param {string} requestId - The request ID to filter logs by
 */
function connectToShortStudyLogStream(requestId) {
    // Close any existing connection
    if (shortStudyLogEventSource) {
        console.log('Closing existing short study log stream connection');
        shortStudyLogEventSource.close();
    }

    console.log(`Connecting to short study log stream with requestId: ${requestId}`);

    // Create a new EventSource connection
    shortStudyLogEventSource = new EventSource(`/api/logs/stream?requestId=${requestId}`);

    // Handle connection open
    shortStudyLogEventSource.onopen = () => {
        console.log('Short study log stream connection established');
        if (shortStudyResultsContainer && shortStudyResultsContainer.querySelector('.list-group')) {
            shortStudyResultsContainer.innerHTML = '<div class="alert alert-info">Connected to log stream. Waiting for logs...</div>';
        }
    };

    // Handle incoming messages
    shortStudyLogEventSource.onmessage = (event) => {
        console.log('Received short study SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
                console.log('Connected to short study log stream');
            } else if (data.type === 'log') {
                console.log('Received short study log:', data.log, 'timestamp:', data.timestamp);
                if (shortStudyResultsContainer && shortStudyResultsContainer.querySelector('.alert-info')) {
                    shortStudyResultsContainer.innerHTML = '';
                }
                appendShortStudyLogEntry(data.log, data.timestamp);
            } else if (data.type === 'complete') {
                console.log('Short study generation complete:', data.message);
                appendShortStudyLogEntry(data.message, data.timestamp);
                if (shortStudyLoadingSpinner) shortStudyLoadingSpinner.classList.add('d-none');
                setTimeout(() => {
                    if (shortStudyLogEventSource) {
                        console.log('Closing short study log stream connection after completion');
                        shortStudyLogEventSource.close();
                        shortStudyLogEventSource = null;
                    }
                }, 1000);
            } else {
                console.warn('Unknown short study message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing short study SSE message:', error, event.data);
        }
    };

    // Handle errors
    shortStudyLogEventSource.onerror = (error) => {
        console.error('Short study log stream error:', error);
        if (shortStudyResultsContainer && shortStudyResultsContainer.querySelector('.alert-info')) {
            shortStudyResultsContainer.innerHTML = '<div class="alert alert-danger">Error connecting to log stream. Logs may be unavailable.</div>';
        }
        if (shortStudyLoadingSpinner) shortStudyLoadingSpinner.classList.add('d-none');
        shortStudyLogEventSource.close();
        shortStudyLogEventSource = null;
    };
}

/**
 * Append a single log entry to the short study display
 * @param {string} log - The log message to append
 * @param {string} timestamp - The timestamp for the log entry
 */
function appendShortStudyLogEntry(log, timestamp) {
    // Skip logs containing "Using default channel name"
    if (log && log.includes("Using default channel name")) {
        console.log('Skipping channel name log:', log);
        return;
    }

    console.log('Appending short study log entry:', log, 'timestamp:', timestamp);

    // Make sure the results section is visible
    if (shortStudyResultsSection) shortStudyResultsSection.classList.remove('d-none');

    // Create the log item list if it doesn't exist yet
    if (!shortStudyResultsContainer.querySelector('.list-group')) {
        console.log('Creating new short study log list');
        const logList = document.createElement('div');
        logList.className = 'list-group';
        shortStudyResultsContainer.appendChild(logList);
    }

    const logList = shortStudyResultsContainer.querySelector('.list-group');

    // Create and append the new log entry
    const logItem = document.createElement('div');
    logItem.className = 'list-group-item';

    if (timestamp) {
        let formattedTime;
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString();
            } else {
                formattedTime = timestamp;
            }
        } catch (e) {
            formattedTime = timestamp;
        }
        logItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <p class="mb-0">${log}</p>
        <small class="text-muted ms-2">${formattedTime}</small>
      </div>
    `;
    } else {
        logItem.innerHTML = `<p class="mb-0">${log}</p>`;
    }

    logList.appendChild(logItem);

    // Scroll to the bottom
    shortStudyResultsContainer.scrollTop = shortStudyResultsContainer.scrollHeight;
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
        let formattedTime;
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                formattedTime = date.toLocaleTimeString();
            } else {
                formattedTime = timestamp;
            }
        } catch (e) {
            formattedTime = timestamp;
        }
        logItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <p class="mb-0">${log}</p>
        <small class="text-muted ms-2">${formattedTime}</small>
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
        hideError(); // Hide main error alert when navigating
        savedLink.classList.add('active');
        if (poemsLink) poemsLink.classList.remove('active');
        if (poemsDirectVideoLink) poemsDirectVideoLink.classList.remove('active');
        if (halloweenPatchworkLink) halloweenPatchworkLink.classList.remove('active');
        if (halloweenLink) halloweenLink.classList.remove('active');
        if (halloweenTransformLink) halloweenTransformLink.classList.remove('active');
        if (halloweenTransformTwoFrameLink) halloweenTransformTwoFrameLink.classList.remove('active');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (poemsDirectVideoContent) poemsDirectVideoContent.classList.add('d-none');
        if (halloweenPatchworkContent) halloweenPatchworkContent.classList.add('d-none');
        if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.add('d-none');
        if (halloweenPatchworkErrorAlert) halloweenPatchworkErrorAlert.classList.add('d-none');
        if (halloweenContent) halloweenContent.classList.add('d-none');
        if (halloweenResultsSection) halloweenResultsSection.classList.add('d-none');
        if (halloweenErrorAlert) halloweenErrorAlert.classList.add('d-none');
        if (halloweenTransformContent) halloweenTransformContent.classList.add('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (halloweenTransformTwoFrameContent) halloweenTransformTwoFrameContent.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (resultsSection) resultsSection.classList.add('d-none');
        if (poemsResultsSection) poemsResultsSection.classList.add('d-none');
        if (poemsErrorAlert) poemsErrorAlert.classList.add('d-none');
        if (poemsDirectVideoResultsSection) poemsDirectVideoResultsSection.classList.add('d-none');
        if (poemsDirectVideoErrorAlert) poemsDirectVideoErrorAlert.classList.add('d-none');
        if (savedContent) savedContent.classList.remove('d-none');
        if (typeof loadSavedGenerations === 'function') {
            loadSavedGenerations();
        }
    });
}


if (halloweenPatchworkLink) {
    halloweenPatchworkLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideError(); // Hide main error alert when navigating
        halloweenPatchworkLink.classList.add('active');
        if (poemsLink) poemsLink.classList.remove('active');
        if (poemsDirectVideoLink) poemsDirectVideoLink.classList.remove('active');
        if (savedLink) savedLink.classList.remove('active');
        if (halloweenLink) halloweenLink.classList.remove('active');
        if (halloweenTransformLink) halloweenTransformLink.classList.remove('active');
        if (halloweenTransformTwoFrameLink) halloweenTransformTwoFrameLink.classList.remove('active');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (poemsDirectVideoContent) poemsDirectVideoContent.classList.add('d-none');
        if (savedContent) savedContent.classList.add('d-none');
        if (halloweenContent) halloweenContent.classList.add('d-none');
        if (halloweenResultsSection) halloweenResultsSection.classList.add('d-none');
        if (halloweenErrorAlert) halloweenErrorAlert.classList.add('d-none');
        if (halloweenTransformContent) halloweenTransformContent.classList.add('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (halloweenTransformTwoFrameContent) halloweenTransformTwoFrameContent.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (resultsSection) resultsSection.classList.add('d-none');
        if (halloweenPatchworkContent) halloweenPatchworkContent.classList.remove('d-none');
        if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.add('d-none');
        if (halloweenPatchworkErrorAlert) halloweenPatchworkErrorAlert.classList.add('d-none');
        if (poemsResultsSection) poemsResultsSection.classList.add('d-none');
        if (poemsErrorAlert) poemsErrorAlert.classList.add('d-none');
    });
}

if (halloweenLink) {
    halloweenLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideError(); // Hide main error alert when navigating
        halloweenLink.classList.add('active');
        if (poemsLink) poemsLink.classList.remove('active');
        if (poemsDirectVideoLink) poemsDirectVideoLink.classList.remove('active');
        if (savedLink) savedLink.classList.remove('active');
        if (halloweenPatchworkLink) halloweenPatchworkLink.classList.remove('active');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (poemsDirectVideoContent) poemsDirectVideoContent.classList.add('d-none');
        if (savedContent) savedContent.classList.add('d-none');
        if (halloweenPatchworkContent) halloweenPatchworkContent.classList.add('d-none');
        if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.add('d-none');
        if (halloweenPatchworkErrorAlert) halloweenPatchworkErrorAlert.classList.add('d-none');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (resultsSection) resultsSection.classList.add('d-none');
        if (halloweenContent) halloweenContent.classList.remove('d-none');
        if (halloweenResultsSection) halloweenResultsSection.classList.add('d-none');
        if (halloweenErrorAlert) halloweenErrorAlert.classList.add('d-none');
        if (halloweenTransformContent) halloweenTransformContent.classList.add('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (halloweenTransformTwoFrameContent) halloweenTransformTwoFrameContent.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
    });
}

if (halloweenTransformLink) {
    halloweenTransformLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideError(); // Hide main error alert when navigating
        halloweenTransformLink.classList.add('active');
        if (poemsLink) poemsLink.classList.remove('active');
        if (poemsDirectVideoLink) poemsDirectVideoLink.classList.remove('active');
        if (savedLink) savedLink.classList.remove('active');
        if (halloweenPatchworkLink) halloweenPatchworkLink.classList.remove('active');
        if (halloweenLink) halloweenLink.classList.remove('active');
        if (halloweenTransformTwoFrameLink) halloweenTransformTwoFrameLink.classList.remove('active');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (poemsDirectVideoContent) poemsDirectVideoContent.classList.add('d-none');
        if (savedContent) savedContent.classList.add('d-none');
        if (halloweenPatchworkContent) halloweenPatchworkContent.classList.add('d-none');
        if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.add('d-none');
        if (halloweenPatchworkErrorAlert) halloweenPatchworkErrorAlert.classList.add('d-none');
        if (halloweenContent) halloweenContent.classList.add('d-none');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (resultsSection) resultsSection.classList.add('d-none');
        if (halloweenTransformContent) halloweenTransformContent.classList.remove('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (halloweenTransformTwoFrameContent) halloweenTransformTwoFrameContent.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
    });
}

if (halloweenTransformTwoFrameLink) {
    halloweenTransformTwoFrameLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideError(); // Hide main error alert when navigating
        halloweenTransformTwoFrameLink.classList.add('active');
        if (poemsLink) poemsLink.classList.remove('active');
        if (poemsDirectVideoLink) poemsDirectVideoLink.classList.remove('active');
        if (savedLink) savedLink.classList.remove('active');
        if (halloweenPatchworkLink) halloweenPatchworkLink.classList.remove('active');
        if (halloweenLink) halloweenLink.classList.remove('active');
        if (halloweenTransformLink) halloweenTransformLink.classList.remove('active');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (poemsDirectVideoContent) poemsDirectVideoContent.classList.add('d-none');
        if (savedContent) savedContent.classList.add('d-none');
        if (halloweenPatchworkContent) halloweenPatchworkContent.classList.add('d-none');
        if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.add('d-none');
        if (halloweenPatchworkErrorAlert) halloweenPatchworkErrorAlert.classList.add('d-none');
        if (halloweenContent) halloweenContent.classList.add('d-none');
        if (halloweenResultsSection) halloweenResultsSection.classList.add('d-none');
        if (halloweenErrorAlert) halloweenErrorAlert.classList.add('d-none');
        if (halloweenTransformContent) halloweenTransformContent.classList.add('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (resultsSection) resultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameContent) halloweenTransformTwoFrameContent.classList.remove('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
        if (poemsResultsSection) poemsResultsSection.classList.add('d-none');
        if (poemsErrorAlert) poemsErrorAlert.classList.add('d-none');
    });
}

if (poemsLink) {
    poemsLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideError(); // Hide main error alert when navigating
        poemsLink.classList.add('active');
        if (savedLink) savedLink.classList.remove('active');
        if (halloweenPatchworkLink) halloweenPatchworkLink.classList.remove('active');
        if (halloweenLink) halloweenLink.classList.remove('active');
        if (halloweenTransformLink) halloweenTransformLink.classList.remove('active');
        if (halloweenTransformTwoFrameLink) halloweenTransformTwoFrameLink.classList.remove('active');
        if (savedContent) savedContent.classList.add('d-none');
        if (halloweenPatchworkContent) halloweenPatchworkContent.classList.add('d-none');
        if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.add('d-none');
        if (halloweenPatchworkErrorAlert) halloweenPatchworkErrorAlert.classList.add('d-none');
        if (halloweenContent) halloweenContent.classList.add('d-none');
        if (halloweenResultsSection) halloweenResultsSection.classList.add('d-none');
        if (halloweenErrorAlert) halloweenErrorAlert.classList.add('d-none');
        if (halloweenTransformContent) halloweenTransformContent.classList.add('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (halloweenTransformTwoFrameContent) halloweenTransformTwoFrameContent.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
        if (poemsDirectVideoContent) poemsDirectVideoContent.classList.add('d-none');
        if (poemsDirectVideoResultsSection) poemsDirectVideoResultsSection.classList.add('d-none');
        if (poemsDirectVideoErrorAlert) poemsDirectVideoErrorAlert.classList.add('d-none');
        if (poemsContent) poemsContent.classList.remove('d-none');
        if (poemsResultsSection) poemsResultsSection.classList.add('d-none');
        if (poemsErrorAlert) poemsErrorAlert.classList.add('d-none');
    });
}

if (poemsDirectVideoLink) {
    poemsDirectVideoLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideError(); // Hide main error alert when navigating
        poemsDirectVideoLink.classList.add('active');
        if (savedLink) savedLink.classList.remove('active');
        if (poemsLink) poemsLink.classList.remove('active');
        if (halloweenPatchworkLink) halloweenPatchworkLink.classList.remove('active');
        if (halloweenLink) halloweenLink.classList.remove('active');
        if (halloweenTransformLink) halloweenTransformLink.classList.remove('active');
        if (halloweenTransformTwoFrameLink) halloweenTransformTwoFrameLink.classList.remove('active');
        if (savedContent) savedContent.classList.add('d-none');
        if (poemsContent) poemsContent.classList.add('d-none');
        if (halloweenPatchworkContent) halloweenPatchworkContent.classList.add('d-none');
        if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.add('d-none');
        if (halloweenPatchworkErrorAlert) halloweenPatchworkErrorAlert.classList.add('d-none');
        if (halloweenContent) halloweenContent.classList.add('d-none');
        if (halloweenResultsSection) halloweenResultsSection.classList.add('d-none');
        if (halloweenErrorAlert) halloweenErrorAlert.classList.add('d-none');
        if (halloweenTransformContent) halloweenTransformContent.classList.add('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (halloweenTransformTwoFrameContent) halloweenTransformTwoFrameContent.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
        if (poemsResultsSection) poemsResultsSection.classList.add('d-none');
        if (poemsErrorAlert) poemsErrorAlert.classList.add('d-none');
        if (poemsDirectVideoContent) poemsDirectVideoContent.classList.remove('d-none');
        if (poemsDirectVideoResultsSection) poemsDirectVideoResultsSection.classList.add('d-none');
        if (poemsDirectVideoErrorAlert) poemsDirectVideoErrorAlert.classList.add('d-none');
    });
}

if (halloweenPatchworkForm) {
    halloweenPatchworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (halloweenPatchworkErrorAlert) halloweenPatchworkErrorAlert.classList.add('d-none');
        if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.add('d-none');
        if (halloweenPatchworkResultsContainer) halloweenPatchworkResultsContainer.innerHTML = '';
        if (halloweenPatchworkLoadingSpinner) halloweenPatchworkLoadingSpinner.classList.remove('d-none');
        
        const lyricsElem = document.getElementById('halloweenPatchworkLyrics');
        const groupFramesElem = document.getElementById('halloweenPatchworkGroupFrames');
        const lyricsText = lyricsElem && lyricsElem.value ? lyricsElem.value.trim() : '';
        const generateGroupFrames = groupFramesElem && groupFramesElem.checked;
        
        if (!lyricsText) {
            if (halloweenPatchworkErrorAlert && halloweenPatchworkErrorMessage) {
                halloweenPatchworkErrorMessage.textContent = 'Please enter song lyrics';
                halloweenPatchworkErrorAlert.classList.remove('d-none');
            }
            if (halloweenPatchworkLoadingSpinner) halloweenPatchworkLoadingSpinner.classList.add('d-none');
            return;
        }
        
        // Create the input format expected by the pipeline
        const songs = [{ lyrics: lyricsText }];
        
        try {
            const response = await fetch('/api/generate-halloween-patchwork', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    input: songs,
                    generateGroupFrames: generateGroupFrames
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'An error occurred during Halloween Patchwork generation');
            }

            if (data.requestId) {
                console.log('Received requestId for Halloween Patchwork generation:', data.requestId);

                // Clear previous results and show results section
                if (halloweenPatchworkResultsContainer) halloweenPatchworkResultsContainer.innerHTML = '';
                if (halloweenPatchworkResultsSection) halloweenPatchworkResultsSection.classList.remove('d-none');
                
                // Connect to log stream for Halloween Patchwork generation
                connectToHalloweenPatchworkLogStream(data.requestId);

                // Add initial message
                appendHalloweenPatchworkLogEntry('Halloween Patchwork generation started: You will see logs in real-time as they are generated.');

                // Fallback message if logs are delayed
                setTimeout(() => {
                    const logGroup = halloweenPatchworkResultsContainer.querySelector('.list-group');
                    if (!logGroup || logGroup.children.length <= 1) {
                        console.log('No logs received via SSE yet for Halloween Patchwork, adding a status message');
                        appendHalloweenPatchworkLogEntry('Waiting for logs. This may take a moment.');
                    }
                }, 3000);
            } else {
                throw new Error('No requestId received from server');
                    }
    } catch (error) {
        if (halloweenPatchworkErrorAlert && halloweenPatchworkErrorMessage) {
            halloweenPatchworkErrorMessage.textContent = error.message || 'An error occurred during Halloween Patchwork generation';
            halloweenPatchworkErrorAlert.classList.remove('d-none');
        }
        if (halloweenPatchworkLoadingSpinner) halloweenPatchworkLoadingSpinner.classList.add('d-none');
    }
    });
}

if (halloweenForm) {
    halloweenForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (halloweenErrorAlert) halloweenErrorAlert.classList.add('d-none');
        if (halloweenTransformContent) halloweenTransformContent.classList.add('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (halloweenTransformTwoFrameContent) halloweenTransformTwoFrameContent.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
        if (halloweenResultsSection) halloweenResultsSection.classList.add('d-none');
        if (halloweenResultsContainer) halloweenResultsContainer.innerHTML = '';
        if (halloweenLoadingSpinner) halloweenLoadingSpinner.classList.remove('d-none');
        
        const lyricsElem = document.getElementById('halloweenLyrics');
        const groupFramesElem = document.getElementById('halloweenGroupFrames');
        const lyricsText = lyricsElem && lyricsElem.value ? lyricsElem.value.trim() : '';
        const generateGroupFrames = groupFramesElem && groupFramesElem.checked;
        
        if (!lyricsText) {
            if (halloweenErrorAlert && halloweenErrorMessage) {
                halloweenErrorMessage.textContent = 'Please enter song lyrics';
                halloweenErrorAlert.classList.remove('d-none');
            }
            if (halloweenLoadingSpinner) halloweenLoadingSpinner.classList.add('d-none');
            return;
        }
        
        // Create the input format expected by the pipeline
        const songs = [{ lyrics: lyricsText }];
        
        try {
            const response = await fetch('/api/generate-halloween', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    input: songs,
                    generateGroupFrames: generateGroupFrames
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'An error occurred during Halloween generation');
            }

            // Start listening for logs via SSE
            if (data.requestId) {
                connectToHalloweenLogStream(data.requestId);
            }
        } catch (error) {
            console.error('Error generating Halloween content:', error);
            if (halloweenErrorAlert && halloweenErrorMessage) {
                halloweenErrorMessage.textContent = error.message || 'An error occurred during Halloween generation';
                halloweenErrorAlert.classList.remove('d-none');
            }
            if (halloweenLoadingSpinner) halloweenLoadingSpinner.classList.add('d-none');
        }
    });
}

if (halloweenTransformForm) {
    halloweenTransformForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (halloweenTransformErrorAlert) halloweenTransformErrorAlert.classList.add('d-none');
        if (halloweenTransformResultsSection) halloweenTransformResultsSection.classList.add('d-none');
        if (halloweenTransformResultsContainer) halloweenTransformResultsContainer.innerHTML = '';
        if (halloweenTransformLoadingSpinner) halloweenTransformLoadingSpinner.classList.remove('d-none');
        
        const lyricsElem = document.getElementById('halloweenTransformLyrics');
        const groupFramesElem = document.getElementById('halloweenTransformGroupFrames');
        const lyricsText = lyricsElem && lyricsElem.value ? lyricsElem.value.trim() : '';
        const generateGroupFrames = groupFramesElem && groupFramesElem.checked;
        
        if (!lyricsText) {
            if (halloweenTransformErrorAlert && halloweenTransformErrorMessage) {
                halloweenTransformErrorMessage.textContent = 'Please enter song lyrics';
                halloweenTransformErrorAlert.classList.remove('d-none');
            }
            if (halloweenTransformLoadingSpinner) halloweenTransformLoadingSpinner.classList.add('d-none');
            return;
        }
        
        // Create the input format expected by the pipeline
        const songs = [{ lyrics: lyricsText }];
        
        try {
            const response = await fetch('/api/generate-halloween-transform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    input: songs,
                    generateGroupFrames: generateGroupFrames
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'An error occurred during Halloween Transform generation');
            }

            // Start listening for logs via SSE
            if (data.requestId) {
                connectToHalloweenTransformLogStream(data.requestId);
            }
        } catch (error) {
            console.error('Error generating Halloween Transform content:', error);
            if (halloweenTransformErrorAlert && halloweenTransformErrorMessage) {
                halloweenTransformErrorMessage.textContent = error.message || 'An error occurred during Halloween Transform generation';
                halloweenTransformErrorAlert.classList.remove('d-none');
            }
            if (halloweenTransformLoadingSpinner) halloweenTransformLoadingSpinner.classList.add('d-none');
        }
    });
}

if (halloweenTransformTwoFrameForm) {
    halloweenTransformTwoFrameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (halloweenTransformTwoFrameErrorAlert) halloweenTransformTwoFrameErrorAlert.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsSection) halloweenTransformTwoFrameResultsSection.classList.add('d-none');
        if (halloweenTransformTwoFrameResultsContainer) halloweenTransformTwoFrameResultsContainer.innerHTML = '';
        if (halloweenTransformTwoFrameLoadingSpinner) halloweenTransformTwoFrameLoadingSpinner.classList.remove('d-none');
        
        const lyricsElem = document.getElementById('halloweenTransformTwoFrameLyrics');
        const groupFramesElem = document.getElementById('halloweenTransformTwoFrameGroupFrames');
        const lyricsText = lyricsElem && lyricsElem.value ? lyricsElem.value.trim() : '';
        const generateGroupFrames = groupFramesElem && groupFramesElem.checked;
        
        if (!lyricsText) {
            if (halloweenTransformTwoFrameErrorAlert && halloweenTransformTwoFrameErrorMessage) {
                halloweenTransformTwoFrameErrorMessage.textContent = 'Please enter song lyrics';
                halloweenTransformTwoFrameErrorAlert.classList.remove('d-none');
            }
            if (halloweenTransformTwoFrameLoadingSpinner) halloweenTransformTwoFrameLoadingSpinner.classList.add('d-none');
            return;
        }
        
        // Create the input format expected by the pipeline
        const songs = [{ lyrics: lyricsText }];
        
        try {
            const response = await fetch('/api/generate-halloween-transform-two-frame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    input: songs,
                    generateGroupFrames: generateGroupFrames
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'An error occurred during Halloween Transform Two Frame generation');
            }

            // Start listening for logs via SSE
            if (data.requestId) {
                connectToHalloweenTransformTwoFrameLogStream(data.requestId);
            }
        } catch (error) {
            console.error('Error generating Halloween Transform Two Frame content:', error);
            if (halloweenTransformTwoFrameErrorAlert && halloweenTransformTwoFrameErrorMessage) {
                halloweenTransformTwoFrameErrorMessage.textContent = error.message || 'An error occurred during Halloween Transform Two Frame generation';
                halloweenTransformTwoFrameErrorAlert.classList.remove('d-none');
            }
            if (halloweenTransformTwoFrameLoadingSpinner) halloweenTransformTwoFrameLoadingSpinner.classList.add('d-none');
        }
    });
}

// Store original lyrics for Poems form
let poemsOriginalLyrics = null;

// Store original lyrics for Poems Direct Video form
let poemsDirectVideoOriginalLyrics = null;

/**
 * Format lyrics based on lines per video setting
 * @param {string} lyrics - Original lyrics text
 * @param {number} linesPerVideo - Number of lines to group together
 * @returns {string} Formatted lyrics
 */
function formatLyricsByLinesPerVideo(lyrics, linesPerVideo) {
    if (!lyrics || linesPerVideo < 1) {
        return lyrics || '';
    }
    
    // Check if input is already in JSON array format
    const trimmedLyrics = lyrics.trim();
    if (trimmedLyrics.startsWith('[')) {
        try {
            const parsed = JSON.parse(lyrics);
            if (Array.isArray(parsed)) {
                // Each element in array is a string that may contain multiple lines joined by space
                // Split each string by space to get individual lines
                const allLines = [];
                for (const chunk of parsed) {
                    if (typeof chunk === 'string') {
                        // Split by space - but this might not be perfect if lines contain spaces
                        // For now, treat each array element as one line
                        allLines.push(chunk);
                    }
                }
                // If linesPerVideo is 1, return as JSON array with one line per element
                if (linesPerVideo === 1) {
                    return JSON.stringify(allLines, null, 2);
                }
                // Re-group and format again
                const chunks = [];
                for (let i = 0; i < allLines.length; i += linesPerVideo) {
                    const chunk = allLines.slice(i, i + linesPerVideo);
                    chunks.push(chunk.join(' '));
                }
                return JSON.stringify(chunks, null, 2);
            }
        } catch (e) {
            // Not valid JSON, treat as regular text
        }
    }
    
    // Split by newlines and filter empty lines
    const allLines = [];
    const inputLines = lyrics.split('\n');
    
    for (const line of inputLines) {
        const trimmedLine = line.trim();
        // Skip empty lines
        if (trimmedLine.length === 0) {
            continue;
        }
        // It's an original line - keep it as is (but trimmed)
        allLines.push(trimmedLine);
    }
    
    // If linesPerVideo is 1, return as JSON array with one line per element
    if (linesPerVideo === 1) {
        return JSON.stringify(allLines, null, 2);
    }
    
    // Group lines into chunks and format as JSON array of strings
    const chunks = [];
    for (let i = 0; i < allLines.length; i += linesPerVideo) {
        const chunk = allLines.slice(i, i + linesPerVideo);
        // Join lines within chunk with space separator
        const chunkText = chunk.join(' ');
        chunks.push(chunkText);
    }
    
    // Format as JSON array of strings
    return JSON.stringify(chunks, null, 2);
}

if (poemsForm) {
    // Handle select change to format lyrics
    if (poemsLinesPerVideo && poemsLyrics) {
        // Store original lyrics when user first changes the select or when textarea is edited
        const updateOriginalIfNeeded = () => {
            const currentValue = poemsLyrics.value;
            // If text doesn't start with "[", it's in original format - update original
            if (!currentValue.trim().startsWith('[')) {
                poemsOriginalLyrics = currentValue;
            }
        };
        
        // Store original lyrics on page load
        if (poemsLyrics.value && !poemsLyrics.value.trim().startsWith('[')) {
            poemsOriginalLyrics = poemsLyrics.value;
        }
        
        // Update original when textarea is edited (if it's in original format)
        poemsLyrics.addEventListener('input', updateOriginalIfNeeded);
        
        // Format lyrics as JSON array when textarea loses focus
        poemsLyrics.addEventListener('blur', () => {
            const currentValue = poemsLyrics.value.trim();
            
            // Only format if it's not already in JSON format
            if (!currentValue.startsWith('[')) {
                // Split by newlines and filter empty lines
                const lines = currentValue.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                
                // Format as JSON array of strings
                if (lines.length > 0) {
                    const formatted = JSON.stringify(lines, null, 2);
                    poemsLyrics.value = formatted;
                    // Update original to the formatted version
                    poemsOriginalLyrics = formatted;
                }
            }
        });
        
        // Handle select change to format lyrics
        poemsLinesPerVideo.addEventListener('change', (e) => {
            const linesPerVideo = parseInt(poemsLinesPerVideo.value, 10) || 1;
            
            // Update original if current text is in original format
            updateOriginalIfNeeded();
            
            // If no original stored yet, use current value (restore from formatted if needed)
            if (poemsOriginalLyrics === null) {
                // If current text is JSON array format, restore original format first
                if (poemsLyrics.value.trim().startsWith('[')) {
                    poemsOriginalLyrics = formatLyricsByLinesPerVideo(poemsLyrics.value, 1);
                } else {
                    poemsOriginalLyrics = poemsLyrics.value;
                }
            }
            
            // Format lyrics based on linesPerVideo
            const formatted = formatLyricsByLinesPerVideo(poemsOriginalLyrics, linesPerVideo);
            poemsLyrics.value = formatted;
        });
    }
    
    poemsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (poemsErrorAlert) poemsErrorAlert.classList.add('d-none');
        if (poemsResultsSection) poemsResultsSection.classList.add('d-none');
        if (poemsResultsContainer) poemsResultsContainer.innerHTML = '';
        if (poemsLoadingSpinner) poemsLoadingSpinner.classList.remove('d-none');
        
        const lyricsText = poemsLyrics && poemsLyrics.value ? poemsLyrics.value.trim() : '';
        const linesPerVideo = poemsLinesPerVideo && poemsLinesPerVideo.value ? parseInt(poemsLinesPerVideo.value, 10) : 1;
        
        if (!lyricsText) {
            if (poemsErrorAlert && poemsErrorMessage) {
                poemsErrorMessage.textContent = 'Please enter song lyrics';
                poemsErrorAlert.classList.remove('d-none');
            }
            if (poemsLoadingSpinner) poemsLoadingSpinner.classList.add('d-none');
            return;
        }
        
        // Create the input format expected by the pipeline
        const songs = [{ lyrics: lyricsText }];
        
        try {
            const response = await fetch('/api/generate-poems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    input: songs,
                    linesPerVideo: linesPerVideo
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'An error occurred during Poems generation');
            }

            // Start listening for logs via SSE
            if (data.requestId) {
                connectToPoemsLogStream(data.requestId);
            }
        } catch (error) {
            console.error('Error generating Poems content:', error);
            if (poemsErrorAlert && poemsErrorMessage) {
                poemsErrorMessage.textContent = error.message || 'An error occurred during Poems generation';
                poemsErrorAlert.classList.remove('d-none');
            }
            if (poemsLoadingSpinner) poemsLoadingSpinner.classList.add('d-none');
        }
    });
}

if (poemsDirectVideoForm) {
    // Handle select change to format lyrics
    if (poemsDirectVideoLinesPerVideo && poemsDirectVideoLyrics) {
        // Store original lyrics when user first changes the select or when textarea is edited
        const updateOriginalIfNeeded = () => {
            const currentValue = poemsDirectVideoLyrics.value;
            // If text doesn't start with "[", it's in original format - update original
            if (!currentValue.trim().startsWith('[')) {
                poemsDirectVideoOriginalLyrics = currentValue;
            }
        };
        
        // Store original lyrics on page load
        if (poemsDirectVideoLyrics.value && !poemsDirectVideoLyrics.value.trim().startsWith('[')) {
            poemsDirectVideoOriginalLyrics = poemsDirectVideoLyrics.value;
        }
        
        // Update original when textarea is edited (if it's in original format)
        poemsDirectVideoLyrics.addEventListener('input', updateOriginalIfNeeded);
        
        // Format lyrics as JSON array when textarea loses focus
        poemsDirectVideoLyrics.addEventListener('blur', () => {
            const currentValue = poemsDirectVideoLyrics.value.trim();
            
            // Only format if it's not already in JSON format
            if (!currentValue.startsWith('[')) {
                // Split by newlines and filter empty lines
                const lines = currentValue.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                
                // Format as JSON array of strings
                if (lines.length > 0) {
                    const formatted = JSON.stringify(lines, null, 2);
                    poemsDirectVideoLyrics.value = formatted;
                    // Update original to the formatted version
                    poemsDirectVideoOriginalLyrics = formatted;
                }
            }
        });
        
        // Handle select change to format lyrics
        poemsDirectVideoLinesPerVideo.addEventListener('change', (e) => {
            const linesPerVideo = parseInt(poemsDirectVideoLinesPerVideo.value, 10) || 1;
            
            // Update original if current text is in original format
            updateOriginalIfNeeded();
            
            // If no original stored yet, use current value (restore from formatted if needed)
            if (poemsDirectVideoOriginalLyrics === null) {
                // If current text is JSON array format, restore original format first
                if (poemsDirectVideoLyrics.value.trim().startsWith('[')) {
                    poemsDirectVideoOriginalLyrics = formatLyricsByLinesPerVideo(poemsDirectVideoLyrics.value, 1);
                } else {
                    poemsDirectVideoOriginalLyrics = poemsDirectVideoLyrics.value;
                }
            }
            
            // Format lyrics based on linesPerVideo
            const formatted = formatLyricsByLinesPerVideo(poemsDirectVideoOriginalLyrics, linesPerVideo);
            poemsDirectVideoLyrics.value = formatted;
        });
    }
    
    poemsDirectVideoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (poemsDirectVideoErrorAlert) poemsDirectVideoErrorAlert.classList.add('d-none');
        if (poemsDirectVideoResultsSection) poemsDirectVideoResultsSection.classList.add('d-none');
        if (poemsDirectVideoResultsContainer) poemsDirectVideoResultsContainer.innerHTML = '';
        if (poemsDirectVideoLoadingSpinner) poemsDirectVideoLoadingSpinner.classList.remove('d-none');
        
        const lyricsText = poemsDirectVideoLyrics && poemsDirectVideoLyrics.value ? poemsDirectVideoLyrics.value.trim() : '';
        const linesPerVideo = poemsDirectVideoLinesPerVideo && poemsDirectVideoLinesPerVideo.value ? parseInt(poemsDirectVideoLinesPerVideo.value, 10) : 1;
        
        if (!lyricsText) {
            if (poemsDirectVideoErrorAlert && poemsDirectVideoErrorMessage) {
                poemsDirectVideoErrorMessage.textContent = 'Please enter song lyrics';
                poemsDirectVideoErrorAlert.classList.remove('d-none');
            }
            if (poemsDirectVideoLoadingSpinner) poemsDirectVideoLoadingSpinner.classList.add('d-none');
            return;
        }
        
        // Create the input format expected by the pipeline
        const songs = [{ lyrics: lyricsText }];
        
        try {
            const response = await fetch('/api/generate-poems-direct-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    input: songs,
                    linesPerVideo: linesPerVideo
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'An error occurred during Poems Direct Video generation');
            }

            // Start listening for logs via SSE
            if (data.requestId) {
                connectToPoemsDirectVideoLogStream(data.requestId);
            }
        } catch (error) {
            console.error('Error generating Poems Direct Video content:', error);
            if (poemsDirectVideoErrorAlert && poemsDirectVideoErrorMessage) {
                poemsDirectVideoErrorMessage.textContent = error.message || 'An error occurred during Poems Direct Video generation';
                poemsDirectVideoErrorAlert.classList.remove('d-none');
            }
            if (poemsDirectVideoLoadingSpinner) poemsDirectVideoLoadingSpinner.classList.add('d-none');
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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialization complete
});