// Fetch the list of available JSON files
const jsonFiles = [
    { name: "All State Market", url: "../json/all_state_market.json" },
    { name: "National Market", url: "../json/national_market.json" },
    { name: "State Boundaries", url: "../json/stateboundry.json" },
    { name: "State Total Data", url: "../json/stateboundry_betting_info_added.json" }
];

// Create a dropdown for selecting feature.properties.date_legalized from stateboundry_betting_info_added.json 

// Select the dropdown element in the HTML page
const dropdown = d3.select("#selDataset");

// Add the options to the dropdown list
jsonFiles.forEach(function (jsonFile) {
    dropdown.append("option").text(jsonFile.name).property("value", jsonFile.url);
});





// Initialize Leaflet map
const map = L.map('map').setView([37.0902, -95.7129], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

//______________________________________VICKY_____MAP__________

//use json with state boundries from  https://eric.clst.org/tech/usgeojson/

let link = "../json/stateboundry_betting_info_added.json";

// The function that will determine the color of a state based on its Ways_to_bet
function chooseColor(Ways_to_bet) {
    if (Ways_to_bet == "Online & In-Person") return "#0570E5"; // Dark Blue
    else if (Ways_to_bet == "In Person Only") return "#001F3F"; // Navy Blue
    else if (Ways_to_bet == "Online Only") return "#3498DB"; // Light Blue
    else if (Ways_to_bet == "Pending") return "#F39C12"; // Yellow
    return "#BDC3C7"; // Grey
}

// Fetch the GeoJSON data and add it to the map with custom colors
fetch(link)
    .then(response => response.json())
    .then(data => {
        const geoJsonLayer = L.geoJSON(data, {
            style: function (feature) {
                return {
                    fillColor: chooseColor(feature.properties.Ways_to_bet),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.5
                };
            },
            filter: function (feature) {
                const selectedYear = parseInt(document.getElementById('yearSelect').value);
                return selectedYear === 0 || feature.properties.year_legalized == selectedYear;
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
                layer.bindPopup("<h1>" + feature.properties.NAME + "</h1> <hr> <h2>Ways to bet: " + feature.properties.Ways_to_bet + "</h2> <hr> <h2>Legalized in: " + feature.properties.date_legalized + "</h2>");
            }
        }).addTo(map);
        document.getElementById('yearSelect').addEventListener('change', function () {
            geoJsonLayer.clearLayers();
            geoJsonLayer.addData(data);
        });
    });

//____________________Graps_______________________________________________________

d3.json("../json/national_market.json").then(function(data) {
    // Convert the data into an array of objects
    const dataArray = Object.values(data);

    // Parse dates and remove dollar signs and commas
    const parseTime = d3.timeParse("%Y-%m-%d");
    dataArray.forEach(function(d) {
        d.month = parseTime(d.month);
        d.revenue = parseFloat(d.revenue.replace(/[\$,]/g, ''));
        d.taxes = parseFloat(d.taxes.replace(/[\$,]/g, ''));
    });

    // Group data by year and calculate sums
    const dataByYear = d3.nest()
        .key(function(d) { return d.month.getFullYear(); })
        .rollup(function(v) { return {
            revenue: d3.sum(v, function(d) { return d.revenue; }),
            taxes: d3.sum(v, function(d) { return d.taxes; })
        }; })
        .entries(dataArray);

    // Set up dimensions for the graph
    const margin = {top: 20, right: 30, bottom: 30, left: 40};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select("#line-graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales for x and y axes
    const x = d3.scaleTime()
        .domain(d3.extent(dataArray, function(d) { return d.month; }))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(dataByYear, function(d) { return Math.max(d.value.revenue, d.value.taxes); })])
        .nice()
        .range([height, 0]);

    // Define line functions
    const lineRevenue = d3.line()
        .x(function(d) { return x(d.key); })
        .y(function(d) { return y(d.value.revenue); });

    const lineTaxes = d3.line()
        .x(function(d) { return x(d.key); })
        .y(function(d) { return y(d.value.taxes); });

    // Append x and y axes
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Append revenue line
    svg.append("path")
        .data([dataByYear])
        .attr("class", "line")
        .style("stroke", "blue")
        .attr("d", lineRevenue);

    // Append taxes line
    svg.append("path")
        .data([dataByYear])
        .attr("class", "line")
        .style("stroke", "green")
        .attr("d", lineTaxes);
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
