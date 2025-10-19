
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
    