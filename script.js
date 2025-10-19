
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

        function initMap() {
            map = L.map('map').setView([40.7589, -73.9851], 13);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
        function initCharts() {
            const chartColors = {
                cyan: 'rgba(0, 212, 255, 1)',
                teal: 'rgba(32, 227, 178, 1)',
                purple: 'rgba(139, 92, 246, 1)',
                orange: 'rgba(255, 179, 71, 1)'
            };

            // Line Chart
            const lineCtx = document.getElementById('lineChart').getContext('2d');
            new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Accessibility',
                            data: [75, 78, 82, 85, 87, 90],
                            borderColor: chartColors.cyan,
                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Diversity',
                            data: [68, 71, 74, 77, 80, 83],
                            borderColor: chartColors.teal,
                            backgroundColor: 'rgba(32, 227, 178, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Economic',
                            data: [72, 74, 76, 78, 81, 84],
                            borderColor: chartColors.purple,
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#fff' }
                        }
                    },
                    scales: {
                        y: {
                            ticks: { color: '#fff' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#fff' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });

            // Radar Chart
            const radarCtx = document.getElementById('radarChart').getContext('2d');
            new Chart(radarCtx, {
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
                            labels: { color: '#fff' }
                        }
                    },
                    scales: {
                        r: {
                            ticks: { color: '#fff', backdropColor: 'transparent' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            pointLabels: { color: '#fff' }
                        }
                    }
                }
            });

            // Doughnut Chart
            const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
            new Chart(doughnutCtx, {
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
                        borderColor: '#0A0F1F'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#fff' }
                        }
                    }
                }
            });

            // Area Chart
            const areaCtx = document.getElementById('areaChart').getContext('2d');
            new Chart(areaCtx, {
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
                            labels: { color: '#fff' }
                        }
                    },
                    scales: {
                        y: {
                            ticks: { color: '#fff' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#fff' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });

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
    if (!tourCompleted) {
        setTimeout(() => {
            startTour();
        }, 1000); // Start tour after 1 second
    }
});

// Allow ESC key to close tour
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('tourOverlay').classList.contains('active')) {
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
<<<<<<< HEAD




/* --- Popup Modal Functions (From before) --- */

const popupModal = document.getElementById('popupModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

function openPopup(title, content) {
  if (popupModal) {
    modalTitle.innerHTML = title;
    modalBody.innerHTML = content;
    popupModal.style.display = 'flex';
  }
}

function closePopup() {
  if (popupModal) {
    popupModal.style.display = 'none';
  }
}

/* *************************************************
  * NEW FUNCTIONS for Accessibility Report Modal
  *************************************************
*/
const reportModal = document.getElementById('reportModal');
let reportMap = null; // Variable to hold the map instance
let reportMarker = null; // Variable to hold the map marker

// Function to open the report modal
function openReportModal() {
  // First, close the info modal if it's open
  closePopup(); 
  
  if (reportModal) {
    reportModal.style.display = 'flex';
    
    // Initialize the map *after* the modal is visible.
    // We use a small delay to ensure the modal div has dimensions.
    setTimeout(initReportMap, 100);
  }
}

// Function to initialize the map inside the report modal
function initReportMap() {
  // Only init if it hasn't been already
  if (!reportMap) { 
    reportMap = L.map('reportMap').setView([40.7128, -74.0060], 13); // Centered on NYC (Change this!)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(reportMap);

    // Handle map click
    reportMap.on('click', function(e) {
        const { lat, lng } = e.latlng;
        
        // Remove old marker if it exists
        if (reportMarker) {
            reportMap.removeLayer(reportMarker);
        }
        
        // Add new marker
        reportMarker = L.marker([lat, lng]).addTo(reportMap)
            .bindPopup('Issue location selected.')
            .openPopup();
            
        // Update hidden form fields
        document.getElementById('reportLat').value = lat;
        document.getElementById('reportLng').value = lng;
    });
  }
}

// Function to close the report modal
function closeReportModal() {
  if (reportModal) {
    reportModal.style.display = 'none';
  }
}

// Handle form submission (for now, just prevents reload and alerts)
const reportForm = document.getElementById('reportForm');
if (reportForm) {
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Stop the form from submitting
        
        const lat = document.getElementById('reportLat').value;
        const type = document.getElementById('reportType').value;
        
        alert(`Report Submitted!
Type: ${type}
Location (Lat): ${lat || 'Not specified'}
Thank you for your feedback!`);
        
        closeReportModal();
    });
}


/* --- Global Click Listener to close modals --- */
window.onclick = function(event) {
  if (event.target == popupModal) {
    closePopup();
  }
  if (event.target == reportModal) {
    closeReportModal();
  }
}

/* *************************************************
  * NEW SECTION for Map View Page
  * This code checks if we are on the map-view.html page
  *************************************************
*/

// Check if the element with ID 'mainMap' exists on the current page
if (document.getElementById('mainMap')) {
    
    // 1. Initialize the Main Map
    const mainMap = L.map('mainMap').setView([40.7128, -74.0060], 12); // Centered on NYC (Change this!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mainMap);

    // 2. Check for URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('layer') === 'districts') {
        // --- This is MOCK data. Replace this with your real GeoJSON file. ---
        const mockDistrictData = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "name": "Sector 4B Watch",
                        "leader": "Jane Doe",
                        "contact": "j.doe@neuracity.watch",
                        "meeting": "October 28th, 7:00 PM at Community Center"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-74.01, 40.71], [-74.00, 40.71], [-74.00, 40.72], [-74.01, 40.72], [-74.01, 40.71]
                        ]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "name": "Downtown District Watch",
                        "leader": "Mike Smith",
                        "contact": "m.smith@neuracity.watch",
                        "meeting": "First Tuesday of each month"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-74.00, 40.71], [-73.99, 40.71], [-73.99, 40.72], [-74.00, 40.72], [-74.00, 40.71]
                        ]]
                    }
                }
            ]
        };
        // --- End of MOCK data ---

        // Function to style the layer
        const districtStyle = {
            color: "#00d4ff",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.2
        };

        // Function to add popups to each feature
        function onEachFeature(feature, layer) {
            if (feature.properties) {
                const popupContent = `
                    <h3>${feature.properties.name}</h3>
                    <p>
                        <strong>Leader:</strong> ${feature.properties.leader}<br>
                        <strong>Contact:</strong> ${feature.properties.contact}<br>
                        <strong>Next Meeting:</strong> ${feature.properties.meeting}
                    </p>
                `;
                layer.bindPopup(popupContent);
            }
        }

        // Add the GeoJSON layer to the map
        L.geoJSON(mockDistrictData, {
            style: districtStyle,
            onEachFeature: onEachFeature
        }).addTo(mainMap);
    }
}

// NOTE: You would also add your toggleMobileMenu() function and
// other shared functions here, outside of any 'if' blocks.
function toggleMobileMenu() {
    // Add your mobile menu logic here
    console.log("Mobile menu toggled");
}
=======
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
  const labels = line.data.labels;
  const datasets = line.data.datasets.map(ds => ({
    label: ds.label,
    data: ds.data
  }));
  return { labels, datasets };
}

// Export as CSV
document.getElementById('exportCsvBtn').onclick = () => {
  const { labels, datasets } = getAnalyticsData();
  const from = document.getElementById('exportFrom').value;
  const to = document.getElementById('exportTo').value;
  let csv = 'Date,' + datasets.map(ds => ds.label).join(',') + '\\n';
  labels.forEach((lbl, i) => {
    const dateOK = (!from || lbl >= from) && (!to || lbl <= to);
    if (!dateOK) return;
    csv += lbl + ',' + datasets.map(ds => ds.data[i]).join(',') + '\\n';
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NeuraCity_Analytics_${from || 'start'}_to_${to || 'end'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export as PDF (requires jsPDF CDN)
const jsPdfScript = document.createElement('script');
jsPdfScript.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
document.head.appendChild(jsPdfScript);

jsPdfScript.onload = () => {
  document.getElementById('exportPdfBtn').onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });
    const { labels, datasets } = getAnalyticsData();
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
      if (!dateOK) return;
      rows.push([lbl, ...datasets.map(ds => ds.data[i].toString())]);
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
};
>>>>>>> eccb0c48a254f3bc70804b55cfb5351bc4ff8802
