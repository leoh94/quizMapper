//Student: 14091815
//Adapted From: https://github.com/claireellul/cegeg077-week5app.git
// the variables
var getGeoJSON;
// a global variable to hold the http request
var client;
// store the map
var mymap;

var testMarkerRed = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'red'
});

var testMarkerPink = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'pink'
});

var testMarkerOrange = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'orange'
	}); 

var testMarkerBlue = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'blue'
});

var popup = L.popup();

// this is the code that runs when the App starts

	loadMap();
	trackLocation();
	getGeoJSON();
	//showPointLineCircle();
	
		
		
// ***********************************
// the functions

function trackLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.watchPosition(showPosition);
		} else {
			alert("geolocation is not supported by this browser");
		}
}
function showPosition(position) {
	var radius = 25;
	// user location
	user = L.marker([position.coords.latitude, position.coords.longitude]).bindPopup("<b>You Are Here!</b>").addTo(mymap);
	//radius of 25m around user location (for user convenience to visually identify close question points) 
	userRadius = L.circle([position.coords.latitude, position.coords.longitude], radius).addTo(mymap);
}

function loadMap(){
		mymap = L.map('mapid').setView([51.505, -0.09], 13);
		// load the tiles
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(mymap);

} 
qMarker = [];
var Datalayer;

// call the server
function getGeoJSON() {
   // set up the request
   client = new XMLHttpRequest();
   // make the request to the URL
   client.open('GET','http://developer.cege.ucl.ac.uk:30263/getData');
   // tell request what method to run that will listen for the response
   client.onreadystatechange = dataResponse; 
   // activate request
   client.send();
}
// receive the response
function dataResponse() {
  // wait for a response: 4 = Ready
  if (client.readyState == 4) {
    // get the data from the response
    var Geodata = client.responseText;
    // call a function that does something with the data
    loadDatalayer(Geodata);
  }
}
function loadDatalayer(Geodata) {
      // convert the text received from the server to JSON 
      var Datajson = JSON.parse(Geodata );
      // load the geoJSON layer
      var Datalayer = L.geoJson(Datajson,
        {
			// use point to layer to create question points
            pointToLayer: function (feature, latlng){
				PointMark = L.marker(latlng)
				PointMark.bindPopup("<b>"+feature.properties.site_location +"</b>");
			qMarker.push(PointMark);
			return PointMark;
				
			},
        }).addTo(mymap);
		mymap.fitBounds(Datalayer.getBounds());
}
//=========== DISTANCE CALCULATION BETWEEN USER & QUESTION POINTS ===============/
//Distance Calculation sourced from:
//https://www.geodatasource.com/developers/javascript
//Function takes lat/long of two locations and returns straight-line distance between them (Haversine Formula)
function getDistanceMiles(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in kilometers
  var dLat = convertDegreesToRadians(lat2-lat1);
  var dLon = convertDegreesToRadians(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(convertDegreesToRadians(lat1)) * Math.cos(convertDegreesToRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Conversion to Kilometers
  var d2 = d * 1000;
  return d2;
}

//Converts numeric degrees to Radians
function convertDegreesToRadians(deg) {
  return deg * (Math.PI/180)
}

//============ DISTANCE CALCULATION BETWEEN USER & WARREN STREET STATION =============/
function getDistance() {
	// getDistanceFromPoint is the function called once the distance has been found
	navigator.geolocation.getCurrentPosition(getDistanceFromPoint);
}

function getDistanceFromPoint(position) {
	// these are the coordinates for Warren Street Station:
	var lat = 51.524616;
	var lng = -0.13818;
	var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
	document.getElementById('showDistance').innerHTML = "Distance: " + distance;
}
//Calculate Distance Between Two Points (User & Warren Street Station)
// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	subAngle = Math.acos(subAngle);
	subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
	dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
	// where radius of the earth is 3956 miles
	if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
	if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
	return dist;
}
//=====================================

function closeDistanceQuestions(){
	checkQuestionDistance(qMarker);
}
// Determine the users distance from each question marker 
function checkQuestionDistance(questionMarker){
	// Get users current location
	latlng = user.getLatLng();
	alert("Checking if you are within 25m of a question"); 
	//Loop question location to track if within 25m from user
	for(var i=0; i<questionMarker.length; i++) {
	    currentMarker = questionMarker[i];
	    currentMarker_latlng = currentMarker.getLatLng();
		// Push to distance
	    var distance = getDistanceMiles(currentMarker_latlng.lat, currentMarker_latlng.lng, latlng.lat, latlng.lng);
	    if (distance <= 25) {
			questionMarker[i].on('click', onClick);
        } else {
			questionMarker[i].bindPopup("Get closer to the question to answer!");
        }
	}
}

// Global variable for the clicked marker
var Clicked;

// Click function initiates questionClick (question form div appears after click on map) 
function onClick(e) {
	questionClick(this);
	Clicked = this;
}

function questionClick(clickedQuestion) {
	// Replace leaflet map div with questions div
	document.getElementById('questions').style.display = 'block';
	document.getElementById('mapid').style.display = 'none';
	// Receive Data
	document.getElementById("question").value = clickedQuestion.feature.properties.question;
	document.getElementById("answer1").value = clickedQuestion.feature.properties.answer1;
	document.getElementById("answer2").value = clickedQuestion.feature.properties.answer2;
	document.getElementById("answer3").value = clickedQuestion.feature.properties.answer3;
	document.getElementById("answer4").value = clickedQuestion.feature.properties.answer4;
	//Create radio button answers
	//Make all buttons unchecked initially
	document.getElementById("radioCheck1").checked = false;
	document.getElementById("radioCheck2").checked = false;
	document.getElementById("radioCheck3").checked = false;
	document.getElementById("radioCheck4").checked = false;
	Clicked = clickedQuestion;
}

// Answer selection requirement
function submitUserAnswer() {
        var c1=document.getElementById("radioCheck1").checked;
        var c2=document.getElementById("radioCheck2").checked;
        var c3=document.getElementById("radioCheck3").checked;
        var c4=document.getElementById("radioCheck4").checked; 
        if (c1==false && c2==false && c3==false && c4==false)
        {
            alert("Please select an answer.");
			return false;
        }
        else 
        {        
        	uploadAnswer()
        }
}

// Variable to tell user answer is correct or not.
var answerTrue;

// Submit answer to the database 
function uploadAnswer() {
	alert ("Submitting...");
	// correct answer
	var cAnswer = Clicked.feature.properties.correct;
	// Assign question
	var question = document.getElementById("question").value;
	// Assign users answer
	var answer;
	// Upload user input to appAnswers database
	var postString = "question="+question; 

	if (document.getElementById("radioCheck1").checked) {
		answer = 1;
        postString=postString+"&answer="+answer;
    }
    if (document.getElementById("radioCheck2").checked) {
		answer = 2;
    	postString=postString+"&answer="+answer;
    }
	if (document.getElementById("radioCheck3").checked) {
		answer =3;
		postString=postString+"&answer="+answer;
	}
	if (document.getElementById("radioCheck4").checked) {
		answer =4;
		postString=postString+"&answer="+answer;
	}
	//Tell user if correct or not.
	if (answer == cAnswer) {
		alert("Correct!");
		answerTrue = true;
	} else {
		alert("Sorry, your answer" +answer+" is incorrect! \n The correct answer is: " + cAnswer);
		answerTrue = false;
	}
	postString = postString + "&cAnswer="+cAnswer;
	processAnswer(postString);
}

// Uploads answer data in postString variable to the database using XMLHttpRequest(
function processAnswer(postString) {
   client = new XMLHttpRequest();
   client.open('POST','http://developer.cege.ucl.ac.uk:30263/uploadAnswer',true);
   client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   client.onreadystatechange = answerSubmitted;  
   client.send(postString);
}

// Receive the response and process
function answerSubmitted() {
  // 4 = Ready 
  if (client.readyState == 4) {
	document.getElementById('questions').style.display = 'none';
	document.getElementById('mapid').style.display = 'block';
	}
}
