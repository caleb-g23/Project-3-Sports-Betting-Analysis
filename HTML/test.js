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
                // set popup showing state name and Ways_to_bet 'tax_status'
                layer.bindPopup("<h3>" + feature.properties.NAME + "</h3><h4>" + feature.properties.Ways_to_bet + "</h4>");
            }


        }).addTo(map);
    });
