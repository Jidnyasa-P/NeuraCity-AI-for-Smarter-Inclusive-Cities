// Page Navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-links a');

    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(pageId).classList.add('active');
    event.target.classList.add('active');

    // Initialize map when map page is shown
    if (pageId === 'map-view' && !window.mapInitialized) {
        initMap();
    }

    // Initialize charts when analytics page is shown
    if (pageId === 'analytics' && !window.chartsInitialized) {
        initCharts();
    }

    // Close mobile menu
    document.querySelector('.nav-links').classList.remove('active');
}

function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

// Map Functionality
let map;
let markers = [];
let currentFilter = 'all';

const zones = [
    {name: "Downtown Core", lat: 40.7589, lng: -73.9851, air: 65, traffic: 85, accessibility: 78, safety: 88},
    {name: "Tech District", lat: 40.7614, lng: -73.9776, air: 82, traffic: 72, accessibility: 92, safety: 95},
    {name: "Residential North", lat: 40.7505, lng: -73.9934, air: 88, traffic: 45, accessibility: 71, safety: 83},
    {name: "Industrial South", lat: 40.7282, lng: -73.9942, air: 54, traffic: 68, accessibility: 65, safety: 76},
    {name: "Cultural Quarter", lat: 40.7648, lng: -73.9808, air: 75, traffic: 58, accessibility: 85, safety: 92}
];

// --- MODIFIED FUNCTION ---
function initMap() {
    // 1. Destroy existing map if it exists
    if (map) {
        map.remove();
        map = null;
    }
    
    // 2. Check theme to select map tiles
    const isLight = document.body.classList.contains('light-mode');
    const tileUrl = isLight 
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' 
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    // 3. Create new map
    map = L.map('map').setView([40.7589, -73.9851], 13);

    L.tileLayer(tileUrl, { // 4. Use the theme-aware URL
        attribution: '© CartoDB'
    }).addTo(map);

    updateMapMarkers();
    window.mapInitialized = true;
}

function getColorForValue(value) {
    if (value >= 80) return '#20E3B2';
    if (value >= 60) return '#00D4FF';
    if (value >= 40) return '#FFB347';
    return '#FF6B6B';
}

function updateMapMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    zones.forEach(zone => {
        let value, label;

        switch(currentFilter) {
            case 'air':
                value = zone.air;
                label = 'Air Quality';
                break;
            case 'traffic':
                value = zone.traffic;
                label = 'Traffic';
                break;
            case 'accessibility':
                value = zone.accessibility;
                label = 'Accessibility';
                break;
            default:
                value = Math.round((zone.air + zone.traffic + zone.accessibility + zone.safety) / 4);
                label = 'Overall';
        }

        const marker = L.circleMarker([zone.lat, zone.lng], {
            radius: 15,
            fillColor: getColorForValue(value),
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        }).addTo(map);

        marker.bindPopup(`
            <div style="color: #000; font-weight: bold;">${zone.name}</div>
            <div style="color: #333;">${label}: ${value}%</div>
        `);

        markers.push(marker);
    });
}

function filterMap(filter) {
    currentFilter = filter;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    updateMapMarkers();
}

// Charts
// --- MODIFIED FUNCTION ---
function initCharts() {
    // 1. Destroy existing charts to prevent errors
    ['lineChart', 'radarChart', 'doughnutChart', 'areaChart'].forEach(id => {
        if (document.getElementById(id)) {
            const chart = Chart.getChart(id);
            if (chart) {
                chart.destroy();
            }
        }
    });

    // 2. Check theme to set colors
    const isLight = document.body.classList.contains('light-mode');
    const textColor = isLight ? '#333' : '#fff';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const chartColors = {
        cyan: 'rgba(0, 212, 255, 1)',
        teal: 'rgba(32, 227, 178, 1)',
        purple: 'rgba(139, 92, 246, 1)',
        orange: 'rgba(255, 179, 71, 1)'
    };
    
    // 3. Check if elements exist before creating charts
    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        new Chart(lineCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    { label: 'Accessibility', data: [75, 78, 82, 85, 87, 90], borderColor: chartColors.cyan, backgroundColor: 'rgba(0, 212, 255, 0.1)', tension: 0.4, fill: true },
                    { label: 'Diversity', data: [68, 71, 74, 77, 80, 83], borderColor: chartColors.teal, backgroundColor: 'rgba(32, 227, 178, 0.1)', tension: 0.4, fill: true },
                    { label: 'Economic', data: [72, 74, 76, 78, 81, 84], borderColor: chartColors.purple, backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.4, fill: true }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor } // THEME-AWARE
                    }
                },
                scales: {
                    y: {
                        ticks: { color: textColor }, // THEME-AWARE
                        grid: { color: gridColor } // THEME-AWARE
                    },
                    x: {
                        ticks: { color: textColor }, // THEME-AWARE
                        grid: { color: gridColor } // THEME-AWARE
                    }
                }
            }
        });
    }

    const radarCtx = document.getElementById('radarChart');
    if (radarCtx) {
        new Chart(radarCtx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Infrastructure', 'Sustainability', 'Innovation', 'Accessibility', 'Safety', 'Economy'],
                datasets: [{
                    label: 'City Performance',
                    data: [85, 78, 92, 85, 91, 76],
                    borderColor: chartColors.cyan,
                    backgroundColor: 'rgba(0, 212, 255, 0.2)',
                    pointBackgroundColor: chartColors.cyan
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor } // THEME-AWARE
                    }
                },
                scales: {
                    r: {
                        ticks: { color: textColor, backdropColor: 'transparent' }, // THEME-AWARE
                        grid: { color: gridColor }, // THEME-AWARE
                        pointLabels: { color: textColor } // THEME-AWARE
                    }
                }
            }
        });
    }

    const doughnutCtx = document.getElementById('doughnutChart');
    if (doughnutCtx) {
        new Chart(doughnutCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Age 18-34', 'Age 35-54', 'Age 55+', 'Under 18'],
                datasets: [{
                    data: [35, 28, 22, 15],
                    backgroundColor: [
                        chartColors.cyan,
                        chartColors.teal,
                        chartColors.purple,
                        chartColors.orange
                    ],
                    borderWidth: 2,
                    borderColor: isLight ? '#F0F4F8' : '#0A0F1F' // THEME-AWARE
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor } // THEME-AWARE
                    }
                }
            }
        });
    }

    const areaCtx = document.getElementById('areaChart');
    if (areaCtx) {
        new Chart(areaCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'City Growth Index',
                    data: [65, 72, 78, 85],
                    borderColor: chartColors.teal,
                    backgroundColor: 'rgba(32, 227, 178, 0.3)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor } // THEME-AWARE
                    }
                },
                scales: {
                    y: {
                        ticks: { color: textColor }, // THEME-AWARE
                        grid: { color: gridColor } // THEME-AWARE
                    },
                    x: {
                        ticks: { color: textColor }, // THEME-AWARE
                        grid: { color: gridColor } // THEME-AWARE
                    }
                }
            }
        });
    }

    window.chartsInitialized = true;
}

// Chatbot
const chatResponses = {
    'air quality': 'Current air quality index is 78 (Good). Pollution levels are within safe limits with PM2.5 at 15 μg/m³. Perfect day for outdoor activities!',
    'traffic': 'Traffic density is moderate at 62%. Main congestion areas are downtown (85%) and tech district (72%). I recommend using Route 5 for faster commutes.',
    'accessibility': 'Downtown accessibility score is 78%. We have 85% wheelchair-accessible buildings, audio signals at 92% of crossings, and Braille signage at major transit points.',
    'safety': 'Overall safety index is excellent at 91%. Emergency response time averages 4.2 minutes, and crime rates have decreased by 15% this year thanks to AI-powered surveillance.',
    'hello': 'Hello! How can I assist you with city information today?',
    'help': 'I can help you with information about air quality, traffic conditions, accessibility features, safety metrics, and general city statistics. What would you like to know?'
};

function toggleChat() {
    document.getElementById('chatWindow').classList.toggle('active');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    setTimeout(() => {
        const response = getResponse(message);
        addMessage(response, 'bot');
    }, 1000);
}

function addMessage(text, type) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getResponse(message) {
    message = message.toLowerCase();

    for (const [key, response] of Object.entries(chatResponses)) {
        if (message.includes(key)) {
            return response;
        }
    }

    return "I'm not sure about that. Try asking me about air quality, traffic, accessibility, or safety in the city!";
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function voiceInput() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = function(event) {
            document.getElementById('chatInput').value = event.results[0][0].transcript;
            sendMessage();
        };
        recognition.start();
    } else {
        addMessage("Voice input is not supported in your browser.", 'bot');
    }
}

// ========== GUIDED TOUR FUNCTIONALITY ==========

let currentTourStep = 1;
const totalTourSteps = 5;

// Start Tour
function startTour() {
    currentTourStep = 1;
    document.getElementById('tourOverlay').classList.add('active');
    updateTourStep();
}

// Skip Tour
function skipTour() {
    document.getElementById('tourOverlay').classList.remove('active');
    localStorage.setItem('neuracityTourCompleted', 'true');
}

// Complete Tour
function completeTour() {
    document.getElementById('tourOverlay').classList.remove('active');
    localStorage.setItem('neuracityTourCompleted', 'true');
    
    // Show welcome message in chatbot
    setTimeout(() => {
        if (document.getElementById('chatMessages')) {
            const welcomeMsg = document.createElement('div');
            welcomeMsg.className = 'message bot';
            welcomeMsg.textContent = "Welcome to NeuraCity! I'm here if you need any help. 😊";
            document.getElementById('chatMessages').appendChild(welcomeMsg);
        }
    }, 500);
}

// Next Tour Step
function nextTourStep() {
    if (currentTourStep < totalTourSteps) {
        currentTourStep++;
        updateTourStep();
    }
}

// Previous Tour Step
function prevTourStep() {
    if (currentTourStep > 1) {
        currentTourStep--;
        updateTourStep();
    }
}

// Update Tour Display
function updateTourStep() {
    // Hide all steps
    document.querySelectorAll('.tour-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStep = document.querySelector(`.tour-step[data-step="${currentTourStep}"]`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
    
    // Update progress dots
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        if (index + 1 === currentTourStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Add click handlers to progress dots
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        dot.onclick = () => {
            currentTourStep = index + 1;
            updateTourStep();
        };
    });
}

// Auto-start tour on first visit
window.addEventListener('DOMContentLoaded', () => {
    const tourCompleted = localStorage.getItem('neuracityTourCompleted');
    if (!tourCompleted && document.getElementById('tourOverlay')) { // Check if tour overlay exists
        setTimeout(() => {
            startTour();
        }, 1000); // Start tour after 1 second
    }
});

// Allow ESC key to close tour
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('tourOverlay') && document.getElementById('tourOverlay').classList.contains('active')) {
        skipTour();
    }
});


// ========== COMMUNITY PAGE FUNCTIONALITY ==========

// Initialize Events Calendar
const events = [
    { day: "20", month: "Oct", name: "Community Tech Festival", location: "Cultural Quarter" },
    { day: "23", month: "Oct", name: "City Clean-Up Drive", location: "Downtown Core" },
    { day: "26", month: "Oct", name: "AI & Smart Cities Meetup", location: "Tech District" },
    { day: "29", month: "Oct", name: "Emergency Response Drill", location: "All Zones" },
    { day: "01", month: "Nov", name: "Accessibility Workshop", location: "Community Center" }
];

function loadEvents() {
    const calendar = document.getElementById('eventsCalendar');
    if (!calendar) return;

    calendar.innerHTML = '';
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        eventDiv.innerHTML = `
            <div class="event-date">
                <span class="day">${event.day}</span>
                <span class="month">${event.month}</span>
            </div>
            <div class="event-details">
                <strong>${event.name}</strong>
                <div class="event-location">📍 ${event.location}</div>
            </div>
        `;
        calendar.appendChild(eventDiv);
    });
}

// Community Poll
let pollVotes = JSON.parse(localStorage.getItem('neuracityPollVotes')) || [25, 38, 42, 19];
let hasVoted = localStorage.getItem('neuracityHasVoted') === 'true';

function updatePollDisplay() {
    const total = pollVotes.reduce((a, b) => a + b, 0);

    pollVotes.forEach((votes, index) => {
        const percentage = total > 0 ? Math.round((votes / total) * 100) : 0;
        const bar = document.getElementById(`pollBar${index}`);
        const percent = document.getElementById(`pollPercent${index}`);

        if (bar) bar.style.width = percentage + '%';
        if (percent) percent.textContent = percentage + '%';
    });

    const voteCount = document.getElementById('pollVoteCount');
    if (voteCount) voteCount.textContent = total + ' votes';
}

// Revote function - allows user to vote again
function revotePoll() {
    localStorage.removeItem('neuracityHasVoted');
    hasVoted = false;

    const pollForm = document.getElementById('communityPollForm');
    const pollThanks = document.getElementById('pollThanks');

    if (pollForm) {
        pollForm.style.display = 'flex';
        pollForm.reset();
    }
    if (pollThanks) {
        pollThanks.classList.add('hidden');
    }
}

const pollForm = document.getElementById('communityPollForm');
if (pollForm) {
    updatePollDisplay();

    if (hasVoted) {
        pollForm.style.display = 'none';
        document.getElementById('pollThanks').classList.remove('hidden');
    }

    pollForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const selectedOption = pollForm.querySelector('input[name="poll"]:checked');
        if (!selectedOption) {
            alert('Please select an option before voting!');
            return;
        }

        const options = ['green', 'transit', 'accessibility', 'emergency'];
        const index = options.indexOf(selectedOption.value);

        if (index !== -1) {
            pollVotes[index]++;
            localStorage.setItem('neuracityPollVotes', JSON.stringify(pollVotes));
            localStorage.setItem('neuracityHasVoted', 'true');
            hasVoted = true;

            updatePollDisplay();
            pollForm.style.display = 'none';
            document.getElementById('pollThanks').classList.remove('hidden');
        }
    });
}

// Feedback Form
const feedbackForm = document.getElementById('feedbackForm');
const feedbackSuccess = document.getElementById('feedbackSuccess');

// Resubmit function - allows user to submit another feedback
function resubmitFeedback() {
    if (feedbackForm) {
        feedbackForm.style.display = 'flex';
        feedbackForm.reset();
    }
    if (feedbackSuccess) {
        feedbackSuccess.classList.add('hidden');
    }
}

if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('feedbackName').value;
        const email = document.getElementById('feedbackEmail').value;
        const category = document.getElementById('feedbackCategory').value;
        const message = document.getElementById('feedbackMessage').value;

        // Simulate submission (in real app, send to server)
        console.log('Feedback submitted:', { name, email, category, message });

        feedbackForm.style.display = 'none';
        feedbackSuccess.classList.remove('hidden');
    });
}

// Add Event Prompt
function addEventPrompt() {
    const eventName = prompt('Enter event name:');
    if (eventName) {
        alert(`Event "${eventName}" submission received! Our team will review and add it to the calendar.`);
    }
}

// Load events on page load
if (document.getElementById('eventsCalendar')) {
    loadEvents();
}
// ========== EXPORT REPORTS FUNCTIONALITY ==========

// Utility: format date to YYYY-MM-DD
function formatDate(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0,10);
}

// Fetch analytics data from charts
function getAnalyticsData() {
  // Example: lineChart data
  const line = Chart.getChart('lineChart');
  if (!line) return { labels: [], datasets: [] }; // Handle page without chart
  
  const labels = line.data.labels;
  const datasets = line.data.datasets.map(ds => ({
    label: ds.label,
    data: ds.data
  }));
  return { labels, datasets };
}

// Export as CSV
const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
    exportCsvBtn.onclick = () => {
        const { labels, datasets } = getAnalyticsData();
        if (labels.length === 0) {
            alert("No chart data to export.");
            return;
        }
        const from = document.getElementById('exportFrom').value;
        const to = document.getElementById('exportTo').value;
        let csv = 'Date,' + datasets.map(ds => ds.label).join(',') + '\n';
        
        labels.forEach((lbl, i) => {
            const dateOK = (!from || lbl >= from) && (!to || lbl <= to);
            if (dateOK) { // Only include if date is ok
                csv += lbl + ',' + datasets.map(ds => ds.data[i]).join(',') + '\n';
            }
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NeuraCity_Analytics_${from || 'start'}_to_${to || 'end'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
}


// Export as PDF (requires jsPDF CDN)
const jsPdfScript = document.createElement('script');
jsPdfScript.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
document.head.appendChild(jsPdfScript);

// Add jspdf-autotable script
const jsPdfAutoTableScript = document.createElement('script');
jsPdfAutoTableScript.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.23/dist/jspdf.plugin.autotable.min.js';
document.head.appendChild(jsPdfAutoTableScript);


jsPdfAutoTableScript.onload = () => {
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.onclick = () => {
            if (typeof jspdf === 'undefined' || typeof jspdf.plugin.autotable === 'undefined') {
                alert("PDF generation library is not loaded yet.");
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape' });
            const { labels, datasets } = getAnalyticsData();
            
            if (labels.length === 0) {
                alert("No chart data to export.");
                return;
            }
            
            const from = document.getElementById('exportFrom').value;
            const to = document.getElementById('exportTo').value;
            doc.setFontSize(16);
            doc.text('NeuraCity Analytics Report', 14, 20);
            doc.setFontSize(10);
            doc.text(`Date Range: ${from || 'Start'} to ${to || 'End'}`, 14, 28);

            // Prepare table: header and rows
            const headers = ['Date', ...datasets.map(ds => ds.label)];
            const rows = [];
            labels.forEach((lbl, i) => {
                const dateOK = (!from || lbl >= from) && (!to || lbl <= to);
                if (dateOK) { // Only include if date is ok
                    rows.push([lbl, ...datasets.map(ds => ds.data[i].toString())]);
                }
            });

            // AutoTable plugin
            doc.autoTable({
                startY: 35,
                head: [headers],
                body: rows,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [0, 212, 255], textColor: 20 },
            });

            doc.save(`NeuraCity_Report_${from || 'start'}_to_${to || 'end'}.pdf`);
        };
    }
};


/* ========== THEME TOGGLE LOGIC (REPLACED) ========== */

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Function to apply the theme AND refresh components
function applyTheme(theme) {
    localStorage.setItem('neuracityTheme', theme);
    
    if (theme === 'light') {
        body.classList.add('light-mode');
        if (themeToggle) themeToggle.checked = true;
    } else {
        body.classList.remove('light-mode');
        if (themeToggle) themeToggle.checked = false;
    }
    
    // RE-INITIALIZE components if they are on the page
    if (document.getElementById('map')) {
        initMap(); // Reloads map with new tiles
    }
    if (document.getElementById('lineChart')) {
        initCharts(); // Reloads charts with new colors
    }
}

// Event Listener for the toggle button
if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            applyTheme('light');
        } else {
            applyTheme('dark');
        }
    });
}

// Run this ONCE on page load to set the theme *before* anything else
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('neuracityTheme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (themeToggle) themeToggle.checked = true;
    } else {
        body.classList.remove('light-mode');
        if (themeToggle) themeToggle.checked = false;
    }
    
    // This removes the need for the 'initTheme' function
    // The theme is now set before the map/chart-specific DOMContentLoaded listeners run
});

// ========== SOUND EFFECTS SYSTEM ==========

// Sound state management
let soundEnabled = localStorage.getItem('neuracitySoundEnabled') !== 'false'; // Default ON

// Sound effects cache
const sounds = {
    click: null,
    hover: null,
    dataLoad: null,
    chatOpen: null,
    chatMessage: null,
    chatSend: null
};

// Initialize sound system
function initSoundSystem() {
    // Load audio elements
    sounds.click = document.getElementById('soundClick');
    sounds.hover = document.getElementById('soundHover');
    sounds.dataLoad = document.getElementById('soundDataLoad');
    sounds.chatOpen = document.getElementById('soundChatOpen');
    sounds.chatMessage = document.getElementById('soundChatMessage');
    sounds.chatSend = document.getElementById('soundChatSend');
    
    // Set initial volumes
    Object.values(sounds).forEach(sound => {
        if (sound) sound.volume = 0.3;
    });
    
    // Add sound toggle button
    addSoundToggleButton();
    
    // Add sound to all interactive elements
    addSoundToElements();
}

// Play sound function
function playSound(soundType) {
    if (!soundEnabled || !sounds[soundType]) return;
    
    const sound = sounds[soundType];
    sound.currentTime = 0; // Reset to start
    sound.play().catch(err => console.log('Sound play prevented:', err));
}

// Add sound toggle button to page
function addSoundToggleButton() {
    const btn = document.createElement('button');
    btn.className = 'sound-toggle-btn' + (soundEnabled ? '' : ' muted');
    btn.innerHTML = soundEnabled ? '🔊' : '🔇';
    btn.title = soundEnabled ? 'Mute sounds' : 'Unmute sounds';
    btn.onclick = toggleSound;
    document.body.appendChild(btn);
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('neuracitySoundEnabled', soundEnabled);
    
    const btn = document.querySelector('.sound-toggle-btn');
    if (btn) {
        btn.innerHTML = soundEnabled ? '🔊' : '🔇';
        btn.title = soundEnabled ? 'Mute sounds' : 'Unmute sounds';
        btn.className = 'sound-toggle-btn' + (soundEnabled ? '' : ' muted');
    }
    
    // Play confirmation sound when enabling
    if (soundEnabled) {
        setTimeout(() => playSound('click'), 100);
    }
}

// Add sounds to interactive elements
function addSoundToElements() {
    
    // 1. BUTTON CLICKS - All buttons
    document.querySelectorAll('button, .btn-primary, .btn-secondary, .cta-button, .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => playSound('click'));
    });
    
    // 2. NAV LINKS
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => playSound('click'));
    });
    
    // 3. CARD HOVERS - Dashboard metrics and community cards
    document.querySelectorAll('.metric-card, .community-card, .chart-card').forEach(card => {
        card.addEventListener('mouseenter', () => playSound('hover'));
    });
    
    // 4. DATA LOADS - When charts or metrics update
    // Trigger on page transitions
    const originalShowPage = window.showPage;
    if (typeof originalShowPage === 'function') {
        window.showPage = function(pageId) {
            playSound('dataLoad');
            originalShowPage(pageId);
        };
    }
    
    // 5. CHATBOT INTERACTIONS
    const chatToggle = document.querySelector('.chat-toggle');
    if (chatToggle) {
        const originalToggleChat = window.toggleChat;
        window.toggleChat = function() {
            const chatWindow = document.getElementById('chatWindow');
            const isOpening = !chatWindow.classList.contains('active');
            
            if (isOpening) {
                playSound('chatOpen');
            }
            
            if (typeof originalToggleChat === 'function') {
                originalToggleChat();
            }
        };
    }
    
    // 6. CHAT MESSAGE SEND
    const originalSendMessage = window.sendMessage;
    if (typeof originalSendMessage === 'function') {
        window.sendMessage = function() {
            playSound('chatSend');
            originalSendMessage();
            
            // Play message received sound after bot responds
            setTimeout(() => playSound('chatMessage'), 1000);
        };
    }
    
    // 7. FORM SUBMISSIONS
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            playSound('click');
        });
    });
    
    // 8. POLL OPTIONS
    document.querySelectorAll('.poll-option').forEach(option => {
        option.addEventListener('click', () => playSound('hover'));
    });
    
    // 9. MAP FILTERS
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => playSound('dataLoad'));
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSoundSystem);
} else {
    initSoundSystem();
}

// Re-attach sounds after dynamic content loads
function reattachSounds() {
    addSoundToElements();
}

// Export for use in other scripts if needed
window.playSound = playSound;
window.reattachSounds = reattachSounds;


// ========== DASHBOARD DETAIL MODALS ==========

const modalData = {
    air: {
        icon: '🌿',
        title: 'Air Quality Full Report',
        sections: [
            {
                heading: 'Current Air Quality Index (AQI)',
                stats: [
                    { value: '78', label: 'Overall AQI', unit: 'Good' },
                    { value: '12', label: 'PM2.5', unit: 'µg/m³' },
                    { value: '34', label: 'Ozone (O₃)', unit: 'ppb' },
                    { value: '8', label: 'PM10', unit: 'µg/m³' }
                ]
            },
            {
                heading: 'Air Quality Trends',
                content: `
                    <p>• Air quality improved by 5% over the last month</p>
                    <p>• Best air quality recorded in: Residential North (AQI: 88)</p>
                    <p>• Areas needing attention: Industrial South (AQI: 54)</p>
                    <p>• Pollution sources: Vehicle emissions (42%), Industrial activity (31%), Construction (18%)</p>
                `
            },
            {
                heading: 'Health Recommendations',
                content: `
                    <p>✅ Outdoor activities are safe for all groups</p>
                    <p>✅ No respiratory health advisories</p>
                    <p>🌳 Consider planting more trees in industrial zones</p>
                `
            }
        ]
    },
    accessibility: {
        icon: '♿',
        title: 'Accessibility Map & Report',
        sections: [
            {
                heading: 'Accessibility Score Breakdown',
                stats: [
                    { value: '85%', label: 'Overall Score', unit: 'Excellent' },
                    { value: '92%', label: 'Public Transport', unit: 'Accessible' },
                    { value: '4,200', label: 'Curb Ramps', unit: 'Installed' },
                    { value: '78%', label: 'Buildings', unit: 'Compliant' }
                ]
            },
            {
                heading: 'Accessible Infrastructure',
                content: `
                    <p>• 92% of public buses are wheelchair accessible</p>
                    <p>• 85% of metro stations have elevators</p>
                    <p>• 4,200+ curb ramps installed citywide</p>
                    <p>• Audio crosswalk signals at 320 intersections</p>
                    <p>• Braille signage in all government buildings</p>
                `
            },
            {
                heading: 'Recent Improvements',
                content: `
                    <p>✅ 12% increase in accessible routes this year</p>
                    <p>🚇 New accessible metro line to Tech District</p>
                    <p>♿ 500+ accessible parking spaces added</p>
                `
            }
        ]
    },
    traffic: {
        icon: '🚗',
        title: 'Live Traffic Report',
        sections: [
            {
                heading: 'Current Traffic Status',
                stats: [
                    { value: '62%', label: 'Traffic Density', unit: 'Moderate' },
                    { value: '28', label: 'Avg Commute', unit: 'minutes' },
                    { value: '45%', label: 'Public Transit', unit: 'Usage' },
                    { value: '15', label: 'Congestion', unit: 'km' }
                ]
            },
            {
                heading: 'Traffic Hotspots',
                content: `
                    <p>🔴 High Congestion: Downtown Core (85% density)</p>
                    <p>🟡 Moderate Congestion: Bridge St (72% density)</p>
                    <p>🟢 Low Congestion: Residential North (45% density)</p>
                    <p>• Peak hours: 8-10 AM, 5-7 PM</p>
                `
            },
            {
                heading: 'AI Recommendations',
                content: `
                    <p>🚇 Use metro line for faster commute to downtown</p>
                    <p>🚴 Bike lanes available on Main St and Park Ave</p>
                    <p>⏰ Travel before 8 AM or after 10 AM to avoid traffic</p>
                    <p>📱 Real-time route optimization via NeuraCity app</p>
                `
            }
        ]
    },
    safety: {
        icon: '🛡️',
        title: 'Safety & Security Report',
        sections: [
            {
                heading: 'Safety Metrics',
                stats: [
                    { value: '91%', label: 'Safety Index', unit: 'Very Safe' },
                    { value: '4', label: 'Response Time', unit: 'minutes' },
                    { value: '1,500', label: 'Active Patrols', unit: 'Units' },
                    { value: '5%', label: 'Crime Reduction', unit: 'vs last year' }
                ]
            },
            {
                heading: 'Safety by Zone',
                content: `
                    <p>🟢 Tech District: 95% (Very Safe)</p>
                    <p>🟢 Cultural Quarter: 92% (Very Safe)</p>
                    <p>🟢 Downtown Core: 88% (Safe)</p>
                    <p>🟡 Industrial South: 76% (Moderately Safe)</p>
                `
            },
            {
                heading: 'Recent Incidents',
                content: `
                    <p>• Total incidents this month: 42 (down 15% from last month)</p>
                    <p>• Emergency response time improved by 8%</p>
                    <p>• 24/7 AI-powered surveillance in 85% of public areas</p>
                    <p>• SOS emergency buttons installed at 200+ locations</p>
                `
            }
        ]
    }
};

function openDetailModal(type) {
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const data = modalData[type];
    
    if (!data) return;
    
    let html = `
        <div class="modal-header">
            <span class="modal-icon">${data.icon}</span>
            <h2 class="modal-title">${data.title}</h2>
        </div>
    `;
    
    data.sections.forEach(section => {
        html += `<div class="modal-section">`;
        html += `<h4>${section.heading}</h4>`;
        
        if (section.stats) {
            html += `<div class="modal-stat-grid">`;
            section.stats.forEach(stat => {
                html += `
                    <div class="modal-stat">
                        <div class="modal-stat-value">${stat.value}</div>
                        <div class="modal-stat-label">${stat.label}</div>
                        ${stat.unit ? `<div class="modal-stat-label">${stat.unit}</div>` : ''}
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        if (section.content) {
            html += section.content;
        }
        
        html += `</div>`;
    });
    
    modalBody.innerHTML = html;
    modal.classList.add('active');
    
    // Play sound
    if (window.playSound) {
        window.playSound('dataLoad');
    }
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    modal.classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('detailModal');
    if (e.target === modal) {
        closeDetailModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDetailModal();
    }
});

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const timestampEl = document.getElementById('lastUpdateTime');
    if (timestampEl) {
        timestampEl.textContent = timeStr;
    }
}

setInterval(updateTimestamp, 60000); // Update every minute
updateTimestamp();
let userPoints = 75; // Example current points, dynamically update this from your backend or app state
let claimedRewards = {
  "Gold Contributor": false,
  "Silver Helper": false,
  "Bronze Participant": false,
};

function toggleAchievementsDropdown() {
  const dropdown = document.getElementById('achievementsDropdown');
  dropdown.classList.toggle('hidden');
  updateAchievementButtons();
}

function updateAchievementButtons() {
  document.getElementById('pointsNavDisplay').textContent = `${userPoints} pts`;

  document.getElementById('claimGoldBtn').disabled = userPoints < 100 || claimedRewards["Gold Contributor"];
  document.getElementById('claimSilverBtn').disabled = userPoints < 60 || claimedRewards["Silver Helper"];
  document.getElementById('claimBronzeBtn').disabled = userPoints < 30 || claimedRewards["Bronze Participant"];
}

function claimReward(rewardName) {
  if (claimedRewards[rewardName]) {
    showClaimStatus(`You already claimed the ${rewardName} reward.`);
    return;
  }
  if ((rewardName === "Gold Contributor" && userPoints < 100) ||
      (rewardName === "Silver Helper" && userPoints < 60) ||
      (rewardName === "Bronze Participant" && userPoints < 30)) {
    showClaimStatus(`Not enough points to claim ${rewardName}.`);
    return;
  }

  claimedRewards[rewardName] = true;
  showClaimStatus(`Congrats! You claimed ${rewardName}.`);

  updateAchievementButtons();
}

function showClaimStatus(message) {
  const status = document.getElementById('claimStatus');
  status.textContent = message;
  setTimeout(() => {
    status.textContent = '';
  }, 4000);
}

// Initialize achievement buttons on page load
document.addEventListener('DOMContentLoaded', () => {
  updateAchievementButtons();
});
