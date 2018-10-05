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

var trains = [];

function displayTrains() {
    for (trainIndex in trains) {

        var train = trains[trainIndex];
        var tableRow = $("<tr>");
        var name = $("<th>");
        name.attr("scope", "row");
        var destination = $("<td>");
        var nextArrival = $("<td>");
        var frequency = $("<td>");
        var timeUntil = $("<td>");
        

        name.text(train.name);
        destination.text(train.destination);
        nextArrival.text(calculateNextArrival(train.startTime, train.frequency));
        frequency.text(train.frequency);
        timeUntil.text(calculateMinutesAway(train.startTime, train.frequency));

        tableRow.append(name, destination, frequency, nextArrival, timeUntil);
        $("#train-display").append(tableRow);
    }
}

function calculateMinutesAway(startTime, frequency) {
    var start = moment(startTime, "HH:mm");
    var now = moment();

    if (now.isBefore(start)) {
        return start.diff(now, 'minutes');
    } else {
        var difference = now.diff(start, 'minutes');
        var remainder = difference % frequency;
        var timeUntilNext = frequency - remainder;
        console.log(timeUntilNext);
        return timeUntilNext;
    }
}

function calculateNextArrival(startTime, frequency) {
    var start = moment(startTime, "HH:mm");
    var now = moment();

    if (now.isBefore(start)) {
        return start.format("hh:mm a")
    } else {
        var timeUntilNext = calculateMinutesAway(startTime, frequency);
        var nextTime = now.add(timeUntilNext, "minutes");
        return nextTime.format("hh:mm a");
    }
}

$("#add-train").on("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    var name = $("#train-name").val().trim();
    var destination = $("#destination").val().trim();
    var startTime = $("#start-time").val().trim();
    var frequency = $("#frequency").val().trim();

    database.ref().push({
        name: name,
        destination: destination,
        startTime: startTime,
        frequency: frequency
    });
});

database.ref().on("value", function(snapshot) {
    trains = [];
    snapshot.forEach(function(childSnapshot) {
        var name = childSnapshot.val().name;
        var destination = childSnapshot.val().destination;
        var startTime = childSnapshot.val().startTime;
        var frequency = childSnapshot.val().frequency;

        var route =  {
            name: name,
            destination: destination,
            startTime: startTime,
            frequency: frequency
        }

        trains.push(route);
    });

    displayTrains();
});