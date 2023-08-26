// Fetch the list of available JSON files
const jsonFiles = [
    { name: "All State Market", url: "path/to/all_state_market.json" },
    { name: "National Market", url: "path/to/national_market.json" },
    { name: "State Boundaries", url: "path/to/state_boundaries.geojson" },
    { name: "State Total Data", url: "path/to/state_total_data.json" }
];

// Create a dropdown for selecting JSON files
const dropdown = d3.select("#selJson");
jsonFiles.forEach(function (jsonFile) {
    dropdown.append("option").text(jsonFile.name).attr("value", jsonFile.url);
});

// Initialize Leaflet map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to fetch and display data for the selected JSON file
function fetchAndDisplayData(jsonUrl) {
    // Fetch JSON data
    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            // Clear existing markers on the map
            map.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Add markers to the map based on data (example)
            if (data.markers) {
                data.markers.forEach(function (markerData) {
                    L.marker([markerData.lat, markerData.lon]).addTo(map);
                });
            }

            // Display charts based on data using Chart.js
            if (data.barChart) {
                displayBarChart(data.barChart.sampleValues, data.barChart.otuIds, data.barChart.otuLabels);
            }
            if (data.bubbleChart) {
                displayBubbleChart(data.bubbleChart.sampleValues, data.bubbleChart.otuIds, data.bubbleChart.otuLabels);
            }
            if (data.gaugeChart) {
                displayGaugeChart(data.gaugeChart.washFreq);
            }

        })
        .catch(error => console.error("Error fetching JSON data:", error));
}

// Function to display bar chart based on data using Chart.js
function displayBarChart(sampleValues, otuIds, otuLabels) {
    // Your Chart.js bar chart code here
}

// Function to display bubble chart based on data using Chart.js
function displayBubbleChart(sampleValues, otuIds, otuLabels) {
    // Your Chart.js bubble chart code here
}

// Function to display gauge chart based on data using Chart.js
function displayGaugeChart(washFreq) {
    // Your Chart.js gauge chart code here
}

// Function to handle JSON file change
function jsonChange() {
    const selectedJsonUrl = dropdown.property("value");
    fetchAndDisplayData(selectedJsonUrl);
}

// Set up event listener for JSON file changes
dropdown.on("change", jsonChange);

// Initialize page with data from the first JSON file
const initialJsonUrl = jsonFiles[0].url;
fetchAndDisplayData(initialJsonUrl);
