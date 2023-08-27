var stateMarket = [];
var nationalMarket = [];
var stateBoundaries = [];
var stateTotal = [];

// select unordered list id
let menuLnk = d3.select("#ulmenu")

// function to handle click event of menu list
function handleClick() {
    
    targetId = d3.event.target.id;
    let dataSet = [];

    if (targetId == 'legal') {
       dataSet = stateMarket;        
    }
    else if (targetId == 'Revenue') {
        dataSet = nationalMarket;
    }
    else if (targetId == 'Taxes') {
        dataSet = restaurantInfo;
    }    
    else if (targetId == 'things') {
        dataSet = thingsInfo;
    }
    

    buildImageSection(dataSet);
    //buildChartSection(dataSet);
    //buildMapSection(dataSet);
    
}

// Event handler for click of menu list items
menuLnk.on('click', handleClick);
    

// function to build Section 1 - images, name and description
function buildImageSection(catData) {
    
    // Populate image section
    let unpicList = d3.select('#islot');
    // Remove all links under the id (populated from earlier views)
    d3.select('#islot').selectAll("li").remove();
    d3.select('#islot').selectAll("h3").remove();
    d3.select('#islot').selectAll("p").remove();

    // loop thru category dataset and add list items with images
    for (i=0; i < catData.length; i++) {
        
        let rankName = "";
        if ((catData[i].name == "") || (catData[i].location == catData[i].name)) {
            rankName = catData[i].rank.toString().concat(". ").concat(catData[i].location)
        }
        else {
            rankName = catData[i].rank.toString().concat(". ").concat(catData[i].name).concat(" ").concat(catData[i].location)
        }

        unpicList.append('li').append('img').attr("id", "pics").attr("src", catData[i].imageurl).attr('alt', 'Not Available')
        unpicList.append('h3').attr("id", "rankName").text(rankName)
        unpicList.append('p').attr("id", "imgDesc").text(catData[i].description)
    }
}




function init() {

    // read json files and store in variables for use later
    // Note: for very large datasets storing is not adviseable - read and populate when required
    d3.json("json/all_state_market.json").then(function(data) {
        stateMarket = data;        
    })

    d3.json("json/national_market.json").then(function(data) {
        nationalMarket = data;        
    })

    d3.json("json/state_boundaries.json").then(function(data) {
        stateBoundaries = data;        
    })

    d3.json("json/state_total_data.json").then(function(data) {
        restaurantInfo = data;        
    })

    d3.json("static/data/destinations.json").then(function(data) {
        destinationInfo = data;        
    })    
    
};

init();