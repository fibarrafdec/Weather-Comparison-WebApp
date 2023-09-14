// Variables declared....
var locationOne = '';
var locationTwo = '';
var northBtn = $('#northBtn');
var southBtn = $('#southBtn');
var photoLocationOne = $('#NorthCardPhoto');
var photoLocationTwo = $('#SouthCardPhoto');

// Constants declared....
const APIKey = "8b9c973be8ff8777178ef11119ab4c94";
const GOOGLE_API_KEY = 'AIzaSyDPIrf1wp-rgDqR4oUstiS_JzehChWazsA';

// getPlaceID is a function that locates the city selected by the user and returns the Google Place ID
function getPlaceID (city, location) {
    // Create the proxy to use
    var herokuURL = 'https://api.allorigins.win/raw?url='
    // URL to be fetched
    var googleSearch = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=' + city + '&inputtype=textquery&key=' + GOOGLE_API_KEY;
    // Fetch the proxy added to the encoded url to be fetched
    fetch(herokuURL + encodeURIComponent(googleSearch), {
        method: 'GET',
        header: 
            {'Content-Type' : 'application/json',},
    })
    .then(function(response){
            response.json().then(function(data){
                var placeID = data.candidates[0].place_id;
                //send the fetched PlaceID to the Google Place Details
                getPhotoReference(placeID, location);
            })
    })
}

// getPhotoReference is a function that takes a PlaceID and gets the Place Detail so we can get the Photo Reference from Google. 
function getPhotoReference(placeID, location) {
    // Create the proxy to use
    var herokuURL = 'https://api.allorigins.win/raw?url='
     // URL to be fetched
    var referenceSearch = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeID + '&key=' + GOOGLE_API_KEY;
    // Fetch the proxy added to the encoded url to be fetched
    fetch(herokuURL + encodeURIComponent(referenceSearch), {
        method: 'GET',
        header: 
            {'Content-Type' : 'application/json',},
    })
    .then(function(response){
        if (response.ok) {
            response.json().then(function(data){
                
                var photoReference = data.result.photos[0].photo_reference;
                // Send the photoreference to be used in the application
                getLocationPhoto(photoReference, location);
            })
        }
    })
}

// getLocationPhoto is a function that takes a Photo Reference and retreives the associated photo to the PlaceID entered by the user
function getLocationPhoto(photoReference, location) {
    // Get the photo
    var photoSearch = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=' + photoReference + '&key=' + GOOGLE_API_KEY;
    // Create an image element
    var image = $('<img>');
    image.attr('src', photoSearch);
   
    // Add the image element to either the location 1 or location 2 area
    if (location === 'north') { 
        photoLocationOne.empty();
        image.attr('alt', 'Photo for ' + locationOne);
        photoLocationOne.append(image);
    } else {
        photoLocationTwo.empty();
        image.attr('alt', 'Photo for ' + locationTwo);
        photoLocationTwo.append(image);
    }
       
}

// northButtonClick is a function that handles the search button click for location 1
function northButtonClick() {
    //Get the value from the location 1 textbox
    locationOne = $('#city-search-north').val();
    if (locationOne === '') {
        return;
    }
    //Get the photo and weather
    getPlaceID(locationOne, 'north');
    weatherGet(locationOne, 'north');
}

// southButtonClick is a function that handles the search button click for location 2
function southButtonClick() {
    // Get the value from the location 2 textbox
    locationTwo = $('#city-search-south').val();
    if (locationTwo === ''){
        return;
    }
    // Get the photo and weather
    getPlaceID(locationTwo, 'south');
    weatherGet(locationTwo, 'south');
}



//Fetch openweather API by user input argument: city.
function weatherGet(city, location) {
    var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=metric&appid=" +
    APIKey;
    // Send an API request by using the JQuery ajax method.
    $.ajax({
    url: queryURL,
    method: "GET",
    }).then(function (response) {
    //Parse API response, get current Day
    var currentDay = response.dt;
    //dynamically add HTML element and CSS class to the Page
    var card = $("<div>").addClass("card text-black bg-light");
    var cardBody = $("<div>").addClass("card-body currentWeather"+location);
    var cardTitle = $("<div>")
        .addClass("card-title")
        .text(dayjs.unix(currentDay).format("MMM D, YYYY, hh:mm:ss A"));
  
    var cityDiv = $("<div>")
        .addClass("card-text")
        .text("City: " + city);
    //Apply weather-conditions, use https://openweathermap.org/img/wn/ type of icon to show the condition
    var iconDiv = $(`<img src=" https://openweathermap.org/img/wn/${response.weather[0].icon}.png"></img>`);
    var tempDiv = $("<div>")
        .addClass("card-text")
        .text("Temperature: " + Math.floor(response.main.temp) + "°C");
    var humDiv = $("<div>")
        .addClass("card-text")
        .text("Humidity: " + Math.floor(response.main.humidity) + "%");
    var windSpeed = $("<div>").text(
        "Wind speed: " + response.wind.speed + " KPH"
    );
    // if the location is location 1 (north) or location 2 (south)
    if (location === 'north'){
        $("#NorthCard").empty();
        $("#NorthCard")
        .append(
            card.append(
            cardBody
                .append(cardTitle)
                .append(cityDiv, iconDiv, tempDiv, humDiv, windSpeed)));
    } else {
        $("#SouthCard").empty();
        $("#SouthCard")
        .append(
            card.append(
            cardBody
                .append(cardTitle)
                .append(cityDiv, iconDiv, tempDiv, humDiv, windSpeed)));
    }
    // Get the UV index for the location
    uvGet(response.coord.lat, response.coord.lon, location);
});
}
 
// A function that gets the UV index for the city
function uvGet(lat, lon, location) {
    var queryURLU = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${APIKey}`;
    
    $.ajax({
        url: queryURLU,
        method: "GET",
    }).then(function (responseU) {
        var uviC = $("<div>").text("UVI ");
        var newSpan = $("<span>").text(responseU.value);
    
        $(".currentWeather"+location).append(uviC.append(newSpan));
    
        if (parseInt(responseU.value) > 5) {
            newSpan.attr("style", "background-color : red");
        } else {
            newSpan.attr("style", "background-color : lightgreen");
        }
    });
}

// Initialization function for the application
function init() {
weatherGet('Fredericton', 'north');
getPlaceID('Fredericton', 'north');
weatherGet('Melbourne', 'south');
getPlaceID('Melbourne', 'south');
}

// Event listeners
northBtn.on('click', northButtonClick);
southBtn.on('click', southButtonClick);

// Start the application
init();
