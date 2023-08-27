// Fetch the list of available JSON files
const jsonFiles = [
    { name: "All State Market", url: "../json/all_state_market.json" },
    { name: "National Market", url: "../json/national_market.json" },
    { name: "State Boundaries", url: "../json/stateboundry.json" },
    { name: "State Total Data", url: "../json/stateboundry_betting_info_added.json" }
];

// Create a dropdown for selecting JSON files
const dropdown = d3.select("#selJson");
jsonFiles.forEach(function (jsonFile) {
    dropdown.append("option").text(jsonFile.name).attr("value", jsonFile.url);
});

// Initialize Leaflet map
const map = L.map('map').setView([37.0902, -95.7129], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

//______________________________________VICKY___________________

//use json with state boundries from  https://eric.clst.org/tech/usgeojson/

let link = "../json/stateboundry_betting_info_added.json";

// The function that will determine the color of a state based on its Ways_to_bet
function chooseColor(Ways_to_bet) {
    if (Ways_to_bet == "Online & In-Person") return "green";
    else if (Ways_to_bet == "In Person Only") return "purple";
    else if (Ways_to_bet == "Online Only") return "purple";
    else if (Ways_to_bet == "Pending") return "yellow";
    return "grey";
}

// Fetch the GeoJSON data and add it to the map with custom colors
fetch(link)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function (feature) {
                return {
                    fillColor: chooseColor(feature.properties.Ways_to_bet),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                };
            }, 
            onEachFeature: function (feature, layer) {
                layer.on({
                    mouseover: function (event) {
                        layer = event.target;
                        layer.setStyle({
                            fillOpacity: 0.9
                        });
                    },
                    mouseout: function (event) {
                        layer = event.target;
                        layer.setStyle({
                            fillOpacity: 0.7
                        });
                    },
                    click: function (event) {
                        map.fitBounds(event.target.getBounds());
                    }
                });
                // set popup showing state name and Ways_to_bet and legalized date: 
                layer.bindPopup("<h1>" + feature.properties.NAME + "</h1> <hr> <h2>" + feature.properties.Ways_to_bet + "</h2> <hr> <h2>" + feature.properties.date_legalized + "</h2>");
            }


        }).addTo(map);
    });










//______________________________________VICKY________________________________________________________________________________________

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
    // Chart.js bar chart code here
}

// Function to display bubble chart based on data using Chart.js
function displayBubbleChart(sampleValues, otuIds, otuLabels) {
    // Chart.js bubble chart code here
}

// Function to display gauge chart based on data using Chart.js
function displayGaugeChart(washFreq) {
    // Chart.js gauge chart code here
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
