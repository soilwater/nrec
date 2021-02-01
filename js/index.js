// Created by Andres Patrignani - January 2021

// Adjustments
let adjustments = {"tillage" : { "noTillage":20, "conventionalTillage":0},
                    "previousCrop": {"wheat":0, "corn":0, "alfalfa":-40, "fallow":-20},
                    "waterInput": {"rainfed":0, "irrigated":20}}


// Get output elements
let latitudeResults = document.getElementById('latitudeResults');
let longitudeResults = document.getElementById('longitudeResults');
let nitrogenAmountResults = document.getElementById('nitrogenAmountResults');
let nitrogenPriceResults = document.getElementById('nitrogenPriceResults');

// Calculate button
let calculate = document.getElementById('calculateBtn').addEventListener('click',run);

function run(){

    // Fill field attributes
    field = document.getElementById('fieldNameInput').value;
    description =  document.getElementById('fieldDescriptionInput').value;
    latitude = latitude;
    longitude = longitude;
    marker = marker;
    timestamp = new Date().toLocaleString();
    crop = document.getElementById('cropInput').value;
    yieldGoal = parseFloat(document.getElementById('yieldGoalInput').value);
    grainPrice = parseFloat(document.getElementById('grainPriceInput').value);
    tillage = document.getElementById('tillageInput').value;
    previousCrop = document.getElementById('previousCropInput').value;
    organicMatter = parseFloat(document.getElementById('organicMatterInput').value);
    waterInput = document.getElementById('waterInput').value;
    fertilizerSource = document.getElementById('fertilizerSourceInput').value.slice(0,-3);
    fertilizerNitrogen = parseFloat(document.getElementById('fertilizerSourceInput').value.slice(-2));
    fertilizerPrice = parseFloat(document.getElementById('fertilizerPriceInput').value);
    sampleDepth = parseFloat(document.getElementById('sampleDepthInput').value);
    sampleNitrate = parseFloat(document.getElementById('nitrateInput').value);
    profileNitrogen = 0.3 * sampleDepth * sampleNitrate;

    // Compute adjustments based on provided data
    let profileNitrogenAdjustment = Math.max(30, profileNitrogen) // lbs N/ac
    let tillageAdjustment = adjustments['tillage'][tillage]
    let waterInputAdjustment = adjustments['waterInput'][waterInput]

    // Compute recommened N amount
    if(crop === 'wheat'){
        nitrogenRecommendation = yieldGoal*2.4 - organicMatter*10 - profileNitrogenAdjustment + tillageAdjustment + waterInputAdjustment;
    } else if(crop  === 'corn'){
        nitrogenRecommendation = yieldGoal*1.6 - organicMatter*20 - profileNitrogenAdjustment + tillageAdjustment + waterInputAdjustment;
    }

    // Compute cost of fertilizer for given recommended N rate
    nitrogenPrice = fertilizerPrice / (2000*fertilizerNitrogen/100)
    nitrogenCost = nitrogenRecommendation * nitrogenPrice;
    fertilizerAmount =  nitrogenRecommendation / (fertilizerNitrogen/100);
    fertilizerCost =  nitrogenCost / (fertilizerNitrogen/100);

    // Print output
    if(latitude === undefined | longitude === undefined){
        alert('Please assign a field name and mark your field in the map.')
    } else {
       
        cell0 = "<td>" + field + "</td>"
        cell1 = "<td>" + yieldGoal.toFixed(0) + "</td>"
        cell2 = "<td>" + nitrogenRecommendation.toFixed(0) + "</td>"
        cell3 = "<td>" + fertilizerAmount.toFixed(0) + "</td>"
        cell4 = "<td>" + fertilizerCost.toFixed(0) + "</td>"
        cell5 = "<td>" + fertilizerSource + "</td>"

        cellBtn = "<td><a class='btn-small red' onclick='deleteRow()'>Delete</a></td>"

        let newRow = document.getElementById('tableResults').insertRow();
        newRow.innerHTML = "<tr>" + cell0 + cell1 + cell2 + cell3 + cell4 + cell5 + cellBtn + "</tr>"
    
        document.getElementById('panelResults').style.display='block';

    }
}

function deleteRow(){
     // event.target will be the input element.
    let td = event.target.parentNode; 
    var tr = td.parentNode; // the row to be removed
    tr.parentNode.removeChild(tr);
    if(document.getElementById('tableResults').children.length == 0){
        document.getElementById('panelResults').style.display='none';
    }

}


// Field coordinates
let latitude;
let longitude;
let marker;
let regionDescription;
let map = L.map('map').setView([38.5, -98], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// map.on('click', function(e) {

// });

function getColor(d) {
    return d == 1  ? '#264653' :
           d == 2  ? '#2a9d8f' :
           d == 3  ? '#e9c46a' :
           d == 4  ? '#f4a261' :
           d == 5  ? '#e76f51' :
           d == 6  ? '#457b9d' :
           d == 7  ? '#1d3557' :
           d == 8  ? '#83c5be' :
                     '#83c5be';
}


function style(feature) {
    return {"color": "#ff7800", "weight": 2, "opacity": 0.65, fillColor: getColor(feature.properties.regions)}
}

let R = new L.geoJSON(agroregions, {style:style}).addTo(map);
R.on('click', function(e) { 
    let regionNumber = e['layer']['feature']['properties']['regions'] - 1;
    console.log(regionNumber)

    if(fieldNameInput.value !== ''){
        latitude = e.latlng.lat;
        longitude = e.latlng.lng;
        if (marker != undefined) {
            map.removeLayer(marker);
        };
       marker = L.marker([latitude,longitude]).addTo(map);  
       marker.bindPopup("<b>Name</b>: " + fieldNameInput.value + "</br>" + 
                        "<b>Latitude</b>: " + latitude.toFixed(5) + "</br>" +
                        "<b>Longitude</b>: " + longitude.toFixed(5) + "</br>" +
                        "<b>Annual rainfall (in)</b>: " + (regionProps[regionNumber]["precip"]/25.4).toFixed(1).toString() + "</br>" +
                        "<b>Typical sand content (%)</b>: " + (regionProps[regionNumber]["sand"]).toFixed(0).toString() + "</br>"
                        ).openPopup();
    }

});

let regionProps = [{"region":1,"precip":713,"gdd":4656,"sand":27},{"region":2,"precip":562,"gdd":4346,"sand":25},{"region":3,"precip":1075,"gdd":4999,"sand":18},{"region":4,"precip":833,"gdd":4265,"sand":16},{"region":5,"precip":704,"gdd":4944,"sand":49},{"region":6,"precip":475,"gdd":4636,"sand":40},{"region":7,"precip":935,"gdd":4655,"sand":15},{"region":8,"precip":493,"gdd":4022,"sand":29},{"region":9,"precip":887,"gdd":5189,"sand":29}];
