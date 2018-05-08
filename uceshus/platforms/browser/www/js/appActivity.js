// the variables
// and a variable that will hold the layer itself – we need to do this outside the function so that we can use it to remove the layer later on 
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
	// user location as pink marker
	user = L.marker([position.coords.latitude, position.coords.longitude]).bindPopup("<b>You Are Here!</b>").addTo(mymap);
	//radius of 25m around user location
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
   // tell the request what method to run that will listen for the response
   client.onreadystatechange = dataResponse; 
   // activate the request
   client.send();
}
// receive the response
function dataResponse() {
  // wait for a response - if readyState is not 4 then keep waiting 
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
			// use point to layer to create the points
            pointToLayer: function (feature, latlng){
				PointMark = L.marker(latlng)
				PointMark.bindPopup("<b>"+feature.properties.site_location +"</b>");
			qMarker.push(PointMark);
			return PointMark;
				
			},
        }).addTo(mymap);
		mymap.fitBounds(Datalayer.getBounds());
}

/*Adapted from:
https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript 
&
https://www.geodatasource.com/developers/javascript */
function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  var d2 = d * 1000;
  return d2;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getDistance() {
	// getDistanceFromPoint is the function called once the distance has been found
	navigator.geolocation.getCurrentPosition(getDistanceFromPoint);
}

function getDistanceFromPoint(position) {
	// find the coordinates of a point using this website:
	// these are the coordinates for Warren Street
	var lat = 51.524616;
	var lng = -0.13818;
	// return the distance in kilometers
	var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
	document.getElementById('showDistance').innerHTML = "Distance: " + distance;
}

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


function closeDistanceQuestions(){
	checkQuestionDistance(qMarker);
}
// Determine the users distance from each question marker 
function checkQuestionDistance(questionMarker){
	// Get users current location
	latlng = user.getLatLng();
	alert("Checking if you are within 25m of a question"); 
	/* Loop each question latlng to determine if any are within 
	25m of the users location */
	for(var i=0; i<questionMarker.length; i++) {
	    currentMarker = questionMarker[i];
	    currentMarker_latlng = currentMarker.getLatLng();
		// Assign to the distance variable
	    var distance = getDistanceFromLatLonInM(currentMarker_latlng.lat, currentMarker_latlng.lng, latlng.lat, latlng.lng);
	    if (distance <= 25) {
			questionMarker[i].on('click', onClick);
        } else {
			questionMarker[i].bindPopup("Get closer to the question to answer!");
        }
	}
}

// Global variable for the clicked marker
var Clicked;

// The marker clicked on the leaflet map is assigned and the qClicked function initiated 
function onClick(e) {
	questionClick(this);
	Clicked = this;
}

function questionClick(clickedQuestion) {
	// Replace leaflet map div with div holding the question 
	document.getElementById('questionDiv').style.display = 'block';
	// Retrieve the relevant information
	document.getElementById("question").value = clickedQuestion.feature.properties.question;
	document.getElementById("answer_1").value = clickedQuestion.feature.properties.answer_1;
	document.getElementById("answer_2").value = clickedQuestion.feature.properties.answer_2;
	document.getElementById("answer_3").value = clickedQuestion.feature.properties.answer_3;
	document.getElementById("answer_4").value = clickedQuestion.feature.properties.answer_4;
	/*Create the way the user will answer the question
	Make all buttons unchecked initially */
	document.getElementById("radioCheck1").checked = false;
	document.getElementById("radioCheck2").checked = false;
	document.getElementById("radioCheck3").checked = false;
	document.getElementById("radioCheck4").checked = false;
	Clicked = clickedQuestion;
}

// Error handing - ensure a radio button is checked
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

// Variable used to determine if user answer is correct
var answerTrue;

// Submit answer to the database 
function uploadAnswer() {
	alert ("Submitting...");
	// Assign the question's correct answer
	var cAnswer = Clicked.feature.properties.correct;
	// Assign the question
	var question = document.getElementById("question").value;
	// Variable used to assign the users answer
	var answer;
	// Variable used in uploading the relevant information to the app_answers database table
	var postString = "question="+question; 

	// now get the radio button values
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
	//Determine if the user got the question correct and alert them appropriately
	if (answer == cAnswer) {
		alert("Correct!");
		answerTrue = true;
	} else {
		alert("Sorry, your answer of " +answer+" is incorrect! \n The correct answer is: " + cAnswer);
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

// Receive the response from the data server and process it
function answerSubmitted() {
  // Wait until data is ready - i.e. readyState is 4
  if (client.readyState == 4) {
	document.getElementById('questions').style.display = 'none';
	document.getElementById('mapid').style.display = 'block';
	}
}

//function showPointLineCircle(){
	// add a point
	//L.marker([51.5, -0.09]).addTo(mymap).bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
