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

//____________________Graps_____VICKY__________________________________________________

// fetch data from json "../json/national_market.json" and prepare a line graph with sum of revenue for each year
d3.json("../json/national_market.json").then(function(data) {
    console.log(data);

    // Convert object to an array of values
    var dataArray = Object.values(data);

    // Prepare data for summing revenue and taxes by year
    var revenueByYear = {};
    var taxesByYear = {};

    // Loop through the data and sum revenue and taxes by year
    dataArray.forEach(function(d) {
        var year = new Date(d.month).getFullYear();
        var revenue = parseFloat(d.revenue.replace(/[\$,]/g, '')); // Convert revenue to a number
        var taxes = parseFloat(d.taxes.replace(/[\$,]/g, '')); // Convert taxes to a number
        if (!revenueByYear[year]) {
            revenueByYear[year] = revenue;
            taxesByYear[year] = taxes;
        } else {
            revenueByYear[year] += revenue;
            taxesByYear[year] += taxes;
        }
    });

    // Extract years, revenue, and taxes for plotting
    var years = Object.keys(revenueByYear);
    var revenue = Object.values(revenueByYear);
    var taxes = Object.values(taxesByYear);

    // Create line graphs for revenue and taxes
    var trace1 = {
        x: years,
        y: revenue,
        mode: "lines",
        name: "Total Revenue"
    };

    var trace2 = {
        x: years,
        y: taxes,
        mode: "lines",
        name: "Taxes"
    };

    var data = [trace1, trace2];
    var layout = {
        title: "Total Revenue and Taxes from Sports Betting in the United States by Year",
        xaxis: { title: "Year" },
        yaxis: { title: "Amount (in millions)" },
        legend: { x: 0, y: 1 }
    };

    Plotly.newPlot("line-graph", data, layout); // Make sure to target the correct element ID here
});