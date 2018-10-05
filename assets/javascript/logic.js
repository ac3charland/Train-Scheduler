// Configure Firebase

var config = {
    apiKey: "AIzaSyCckO5Pnbd05cxxCJhrWeQCr0yBjhPYAzc",
    authDomain: "train-scheduler-a48f3.firebaseapp.com",
    databaseURL: "https://train-scheduler-a48f3.firebaseio.com",
    projectId: "train-scheduler-a48f3",
    storageBucket: "train-scheduler-a48f3.appspot.com",
    messagingSenderId: "293730820034"
};
firebase.initializeApp(config);

var database = firebase.database();

// Create a local array to store the train routes in Firebase
var trains = [];

// Writes the train routes to the DOM
function displayTrains() {
    for (trainIndex in trains) {

        // Get a reference to the current train in trains
        var train = trains[trainIndex];

        // Create the components of our table row using jQuery
        var tableRow = $("<tr>");
        var name = $("<th>");
        name.attr("scope", "row");
        var destination = $("<td>");
        var nextArrival = $("<td>");
        var frequency = $("<td>");
        var timeUntil = $("<td>");
        
        // Set the text of the table row components.
        name.text(train.name);
        destination.text(train.destination);
        nextArrival.text(calculateNextArrival(train.startTime, train.frequency));
        frequency.text(train.frequency);
        timeUntil.text(calculateMinutesAway(train.startTime, train.frequency));

        // Append the table row components to our table row
        tableRow.append(name, destination, frequency, nextArrival, timeUntil);

        // Append the completed table row to the train route container
        $("#train-display").append(tableRow);
    }
}

// Calculate the number of minutes until the next train, based on its start time and its frequency
function calculateMinutesAway(startTime, frequency) {
    // Get moment.js references to now and to the start time of the route
    var start = moment(startTime, "HH:mm");
    var now = moment();

    // If the user is looking before the route has begun, 
    // the time until the next train is the time until the first train.
    if (now.isBefore(start)) {
        return start.diff(now, 'minutes');
    } 
    
    // Otherwise, some slightly fancier math is needed to find the time until the next train:
    else {
        // Figure out how many minutes have elapsed since the first train of the day
        var difference = now.diff(start, 'minutes');
        // Figure out the remainder of difference / frequency (AKA minutes since the last train)
        var remainder = difference % frequency;
        // Subtract the remainder from frequency to get minutes until the next train
        var timeUntilNext = frequency - remainder;
        return timeUntilNext;
    }
}

// Calculate the time of the next train.
function calculateNextArrival(startTime, frequency) {
    // Get moment.js references to now and to the start time of the route
    var start = moment(startTime, "HH:mm");
    var now = moment();

    // If the user is looking before the route has begun, the time of the next train is the time of the first train.
    if (now.isBefore(start)) {
        return start.format("hh:mm a")
    } 
    
    // Otherwise, get the time that is now + timeUntilNext minutes away to get the time of the next train.
    else {
        var timeUntilNext = calculateMinutesAway(startTime, frequency);
        var nextTime = now.add(timeUntilNext, "minutes");
        return nextTime.format("hh:mm a");
    }
}

// When the user adds a train route, run this function
$("#add-train").on("click", function(event) {
    event.preventDefault();

    // Store the user's inputs as variables
    var name = $("#train-name").val().trim();
    var destination = $("#destination").val().trim();
    var startTime = $("#start-time").val().trim();
    var frequency = $("#frequency").val().trim();

    // Push those values to a new child in the DB
    database.ref().push({
        name: name,
        destination: destination,
        startTime: startTime,
        frequency: frequency
    });
});


// When the database updates, run this function
database.ref().on("value", function(snapshot) {
    // Clear trains
    trains = [];

    // Repopulate trains with data from each child in the DB
    snapshot.forEach(function(childSnapshot) {
        // Get the current route's information and store in variables
        var name = childSnapshot.val().name;
        var destination = childSnapshot.val().destination;
        var startTime = childSnapshot.val().startTime;
        var frequency = childSnapshot.val().frequency;

        // Create a route object & give its properties the values we pulled from Firebase
        var route =  {
            name: name,
            destination: destination,
            startTime: startTime,
            frequency: frequency
        }

        // Push the finished route object to the end of the trains array
        trains.push(route);
    });

    // Once trains is repopulated, update the DOM.
    displayTrains();
});