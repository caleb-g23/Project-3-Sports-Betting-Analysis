// Fetch the list of available JSON files
const jsonFiles = [
  { name: "All State Market", url: "../json/all_state_market.json" },
  { name: "National Market", url: "../json/national_market.json" },
  { name: "State Boundaries", url: "../json/stateboundry.json" },
  {
    name: "State Total Data",
    url: "../json/stateboundry_betting_info_added.json"
  }
];
//-------------------VICKY------------------ NATIONAL DATA PAGE -----------------------------
// Create a dropdown for selecting feature.properties.date_legalized from stateboundry_betting_info_added.json
// Select the dropdown element in the HTML page
const dropdown = d3.select("#selDataset");

// Add the options to the dropdown list
jsonFiles.forEach(function (jsonFile) {
  dropdown.append("option").text(jsonFile.name).property("value", jsonFile.url);
});

// Initialize Leaflet map
const map = L.map("map").setView([37.0902, -95.7129], 4);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// global var
let revenueChart = null;

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
d3.json(link).then((data) => {
  let geoJsonLayer = L.geoJSON(data, {
    style: function (feature) {
      return {
        fillColor: chooseColor(feature.properties.Ways_to_bet),
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.5,
      };
    },
    filter: function (feature) {
      const selectedYear = parseInt(
        document.getElementById("yearSelect").value
      );
      if (selectedYear === 0) return true;
      else
        return (
          feature.properties.date_legalized &&
          parseInt(feature.properties.date_legalized.slice(-4)) === selectedYear
        );
    },
    onEachFeature: function (feature, layer) {
      layer.on({
        mouseover: function (event) {
          layer.setStyle({
            fillOpacity: 0.9,
          });
        },
        mouseout: function (event) {
          layer.setStyle({
            fillOpacity: 0.7,
          });
        },
        click: function (event) {
          map.fitBounds(event.target.getBounds());
        },
      });

      // Create custom popup content
      const popupContent =
        "<div class='popup-content'>" +
        "<h1>" +
        feature.properties.NAME +
        "</h1>" +
        "<div class='popup-details'>" +
        "<p><strong>Ways to bet:</strong> " +
        feature.properties.Ways_to_bet +
        "</p>" +
        "<p><strong>Legalized in:</strong> " +
        feature.properties.date_legalized +
        "</p>" +
        "</div>" +
        "</div>";

      // Bind popup with custom content
      layer.bindPopup(popupContent);
    },
  }).addTo(map);

  document.getElementById("yearSelect").addEventListener("change", function () {
    geoJsonLayer.clearLayers();
    geoJsonLayer.addData(data);
  });
});

//____________________Graphs_____VICKY__________________________________________________

// TOTAL REVENUE & TAXES -- LINE GRAPH
//fetch data from ../json/stateboundry_betting_info_added.json and prepare a pie chart with tax_status
d3.json("../json/stateboundry_betting_info_added.json").then(function (data) {
  // Convert object to an array of features
  // filter for allowable values
  var features = data.features.filter(
    (feature) =>
      feature.properties.Ways_to_bet &&
      feature.properties.tax_status &&
      feature.properties.date_legalized
  );

  // Function to update the pie chart based on the selected year
  function updatePieChart(selectedYear) {
    // Prepare data for pie chart
    var taxStatusCounts = {
      YES: 0, // Custom label for "Yes"
      NO: 0, // Custom label for "No"
    };
    // Loop through the features and count tax statuses
    features.forEach(function (feature) {
      // you'll want to filter your data to account for 'nan', null, missing properties, etc.
      var yearLegalized = parseInt(feature.properties.date_legalized.slice(-4));
      if (!yearLegalized) yearLegalized = 0;
      if (selectedYear === 0 || yearLegalized === selectedYear) {
        var tax = feature.properties.tax_status;
        if (tax === "Yes") {
          taxStatusCounts["YES"] += 1;
        } else if (tax === "No") {
          taxStatusCounts["NO"] += 1;
        }
      }
    });

    // Extract tax status labels and counts for plotting
    var taxStatusLabels = Object.keys(taxStatusCounts);
    var taxStatusValues = Object.values(taxStatusCounts);
    console.log(taxStatusLabels)
    // Create pie chart data
    var pieChartData = [
      {
        values: taxStatusValues,
        labels: taxStatusLabels,
        type: "pie",
      },
    ];

    var pieChartLayout = {
      title: "States Taxing Income from Sports Betting",
      height: 500,
      width: 500,
    };
    console.log(pieChartData, pieChartLayout)
    Plotly.newPlot("pie-chart", pieChartData, pieChartLayout); // Make sure to target the correct element ID here
  }

  // Initial update based on selected year
  let selectedYear = parseInt(document.getElementById("yearSelect").value);
  console.log(selectedYear)
  updatePieChart(selectedYear);

  // Add event listener to the year dropdown
  document
    .getElementById("yearSelect")
    .addEventListener("change", function (e) {
      let selectedYear = parseInt(e.target.value);
      console.log(selectedYear)
      updatePieChart(selectedYear);
    });
});

// INCOME TAXATION -- LINE GRAPH
// fetch data from json "../json/national_market.json" and prepare a line graph with sum of revenue for each year
d3.json("../json/national_market.json").then(function (data) {
  // Convert object to an array of values
  var dataArray = Object.values(data);

  // Prepare data for summing revenue and taxes by year
  var revenueByYear = {};
  var taxesByYear = {};

  // Loop through the data and sum revenue and taxes by year
  dataArray.forEach(function (d) {
    var year = new Date(d.month).getFullYear();
    var revenue = parseFloat(d.revenue.replace(/[\$,]/g, "")); // Convert revenue to a number
    var taxes = parseFloat(d.taxes.replace(/[\$,]/g, "")); // Convert taxes to a number
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
    name: "Total Revenue",
  };

  var trace2 = {
    x: years,
    y: taxes,
    mode: "lines",
    name: "Taxes",
  };

  var lineData = [trace1, trace2];
  var layout = {
    title: "Total Revenue and Taxes from Sports Betting",
    xaxis: { title: "Year" },
    yaxis: { title: "Amount (in millions)" },
    legend: { x: 0, y: 1 },
  };

  Plotly.newPlot("line-graph", lineData, layout); // Make sure to target the correct element ID here
});

// ----------------- STATE TOGGLE on the State Data Page

const stateSelect = document.getElementById("stateSelect");
const stateSearch = document.getElementById("stateSearch");

// List of USA states
const states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const stateDropdown = document.getElementById("stateSelect");
const chartCanvas = document.getElementById("revenueTaxesChart");

const total = "../json/state_total_data.json";
// global data variable for states containing usable data
let data = await d3
  .json(total)
  .then((dataRes) =>
    Object.values(dataRes).filter(
      (state) =>
        state.revenue !== "$nan" &&
        state.taxes !== "$nan" &&
        state.handle !== "$nan"
    )
  );
// Populate the dropdown with state options
data.forEach((item, index) => {
  const option = document.createElement("option");
  option.value = item.state;
  option.innerText = item.state;
  stateDropdown.appendChild(option);
});

// Initialize chart with default state
updateChart(data[0]);

// Dropdown change event handler
stateDropdown.addEventListener("change", (event) => {
  const selectedState = event.target.value;
  const selectedData = data.filter((state) => state.state === selectedState)[0];
  updateChart(selectedData);
  buildStateInfo(selectedData);
  if (selectedData) {
    stateDataContainer.innerHTML = `
        <p>State: ${selectedData.state}</p>
        <p>Handle: ${selectedData.handle}</p>
        <p>Revenue: ${selectedData.revenue}</p>
        <p>Hold: ${selectedData.hold}</p>
        <p>Taxes: ${selectedData.taxes}</p>
        <p>Population 18+: ${selectedData['population total 18+']}</p>
        <p>Revenue Per Person: ${selectedData['Revenue Per Person']}</p>
    `;
  }
});

// Populate the select options with states
function populateStates(searchTerm = "") {
  stateSelect.innerHTML = "";
  let filteredStates = data.filter((state) =>
    state.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filteredStates.forEach((state) => {
    const option = document.createElement("option");
    option.value = state.state;
    option.textContent = state.state;
    stateSelect.appendChild(option);
  });
}

// Handle search input changes
stateSearch.addEventListener("input", (e) => {
  populateStates(e.target.value);
});

///------------------Ryan------------------ State DATA PAGE -----------------------------
// Set JSON files for data pulls
const monthly = "../json/all_state_market.json";
// global monthlyData variable
let monthlyData = await d3.json(monthly).then((res) => Object.values(res));

// Function that populates state info
function buildStateInfo(name) {
  //Fetch JSON data and print to console
  // filter data for state passed in to function
  // let stateTotalData = monthlyData.filter(
  //   (thisState) => thisState.state === state
  // );
  console.log(name)
  const selectedData = data.filter((state) => state.state === name)[0];
  console.log(selectedData)
  // stateTotalData.forEach((state) => {
  //   console.log("State: " + state.state);
  //   console.log("Handle: " + state.handle);
  //   console.log("Revenue: " + state.revenue);
  //   console.log("Taxes: " + state.taxes);
  //   console.log("Start Month: " + state.date);
  // });
}
// initialize state data
buildStateInfo(data[0].state)
if (data[0]) {
  stateDataContainer.innerHTML = `
      <p>State: ${data[0].state}</p>
      <p>Handle: ${data[0].handle}</p>
      <p>Revenue: ${data[0].revenue}</p>
      <p>Hold: ${data[0].hold}</p>
      <p>Taxes: ${data[0].taxes}</p>
      <p>Population 18+: ${data[0]['population total 18+']}</p>
      <p>Revenue Per Person: ${data[0]['Revenue Per Person']}</p>
  `;
}
// Function to update the chart based on selected data
function updateChart(data) {
  if (revenueChart) revenueChart.destroy();

  let { revenue, taxes, handle } = data;

  try {
    // parse string amounts to 'BigInt' and plot in barChart
    revenue = BigInt(revenue.slice(1).replaceAll(",", "").slice(0, -3));
    taxes = BigInt(taxes.slice(1).replaceAll(",", "").slice(0, -3));
    handle = BigInt(handle.slice(1).replaceAll(",", "").slice(0, -3));

    const ctx = chartCanvas.getContext("2d");
    revenueChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Revenue", "Taxes", "Handle"],
        datasets: [
          {
            label: "Amount ($)",
            data: [Number(revenue), Number(taxes), Number(handle)],
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Amount ($)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Categories",
            },
          },
        },
      },
    });
  } catch {
    console.log("could not convert to bigint");
  }

}