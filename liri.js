// SETUP
// ========================================================

    // .env file, which enables Spotify access
    require("dotenv").config();
    var keys = require("./keys.js");


// GET PACKAGES (and store them as variables)
// ========================================================

    // Spotify -- get music info
    var Spotify = require('node-spotify-api');

    // Axios -- get data from the OMDB API and the Bands In Town API
    var axios = require("axios");

    // Moment -- library to help convert time
    var moment = require("moment");

    // fs Node package for "do-what-it-says" command
    var fs = require("fs");

    // request npm package
    var request = require("request")

// USER ENGAGEMENT OF THE APP (global variables)
// ========================================================

    /* 
    FROM ASSIGNMENT: These are the possible commands from the user --
        • concert-this <artist/band name here>
        • spotify-this-song '<song name here>'
        • movie-this '<movie name here>'
        • do-what-it-says
    */

    // anything that the user puts in the bash command line
    var userNodeInput = process.argv;

    // any of the four 'commands' (above) that the user can use OR anything not recognized as one of the four
    var userCommand = process.argv[2];

    // the potential user inputs '<>' -- could be null or could be searchable in the APIs
    var userInput = '';


// CONVERT COMMAND + USER INPUT TO LIRI.JS
// =================================================================================

    // Use Switch to convert value input
    switch (userCommand) {
        case " ": // user input of 'concert-this' function
            appSearchParameters(); // process user input and run search or run defaults
            findConcert(userInput); // run findConcert function
            break;

        case "spotify-this-song": // user input of 'spotify-this-song' function
            appSearchParameters(); // process user input and run search or run defaults
            findSong(userInput); // run findSong function
            break;

        case "movie-this": // user input of 'movie-this' function
            appSearchParameters(); // process user input and run search or run defaults
            findMovie(userInput); // run findMovie function
            break;

        case "do-what-it-says": // user input of 'do-what-it-says' function
            doTheThing(userInput); // run doTheThing function
            break;

        default:
            console.log("LIRI does not recognize this command. LIRI does understand 'concert-this', 'spotify-this-song', 'movie-this' and 'do-what-it-says");
    }

// FUNCTIONS
// =================================================================================
    
    // Process user input for search parameters or set defaults
    function appSearchParameters () {
        
        // use userInput from command line -- parse out multiple parameters or just one
        for (var i = 3; i < userNodeInput.length; i++) {
            if (i > 3 && i < userNodeInput) {
                userInput = userInput + " " + userNodeInput[i];
            } else {
                userInput += userNodeInput[i];
            }
        }

        // default 'concert-this' search; otherwise, run user input
        if (userCommand === 'concert-this' && userNodeInput.length <= 3) {
            queryURL = "https://rest.bandsintown.com/artists/artists/events?app_id=codingbootcamp";
        } else {
            queryURL = "https://rest.bandsintown.com/artists/" + userInput + "/events?app_id=codingbootcamp";
        }

        // default 'spotify-this-song' search; otherwise, run user input
        if (userCommand === "spotify-this-song" && userNodeInput.length <= 3) {
            userInput = process.argv.slice(3).join(" ");
            
        }

        // default 'movie-this' search; otherwise, run user input
        if (userCommand === "movie-this" && userNodeInput.length <= 3) {
            queryUrl = "http://www.omdbapi.com/?t=the+matrix&y=&plot=short&apikey=trilogy"
        } else {
            queryUrl = "http://www.omdbapi.com/?t=" + userInput + "&y=&plot=short&apikey=trilogy";
        }
    }


    // findConcert function
    function findConcert () {

        var queryURL = "https://rest.bandsintown.com/artists/" + userInput + "/events?app_id=codingbootcamp";

        // issue API request
        request (queryURL, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var concertData = JSON.parse(body);

                for (var i=0; i < concertData.length; i++) {
                    console.log("Venue: " + concertData[i].venue.name);

                    // get venue location
                    if (concertData[i].venue.region == "") {
                        console.log("Location: " + concertData[i].venue.city + ", " + concertData[i].venue.country);
                    } else {
                        console.log("Location: " + concertData[i].venue.city + ", " + concertData[i].venue.region + ", " + concertData[i].venue.country);
                    }

                    // use momentJS to format concert date
                    var date = concertData[i].datetime;
                    date = moment(date).format("MM/DD/YYYY");
                    console.log("Date: " + date);
                }
            }
        });
    }

    // findSong function
    function findSong (userInput) {
        var spotify = new Spotify (keys.spotify);

        spotify.search ({ 
                type: "track", 
                query: userInput
            }, function (err, data) {
                if (err) {
                    console.log("Error occurred: " + err);
                } else {
                    for (var i=0; i < data.tracks.items.length; i++) {
                        var songData = data.tracks.items[0];

                        if (i === 0) {
                            console.log("\n========================")
                            console.log("Artist: " + songData.artists[0].name);
                            console.log("Song name: " + songData.name);
                            console.log("Album name: " + songData.album.name);
                            console.log("Preview link: " + songData.preview_url);
                            console.log("========================\n")
                        }
                    }
                }
            })
    }


    // findMovie function
    function findMovie (userInput) {

        var queryURL = "http://www.omdbapi.com/?t=" + userInput + "&y=&plot=short&apikey=trilogy";

        request (queryURL, function (error, response, body) {

            var movieData = JSON.parse(body);

            if (!error && response.statusCode === 200) {
                console.log("--------------Movie--------------" + "\n" + "Title: " + movieData.Title + "\n" + "Release Year: " + movieData.Year + "\n" + "IMDB Rating: " + movieData.Ratings[0].Value + "\n"+ "Country of production: " + movieData.Country + "\n" + "Language: " + movieData.Language + "\n" + "Plot: " + movieData.Plot + "\n" + "Actors: " + movieData.Actors + "\n");
            }

        }) // end of request
        
     } // end of findMovie function

    // doTheThing function
     function doTheThing () {

        fs.readFile('random.txt', "utf8", function (error, data) {
            if (error) {
                return console.log("Error occurred: " + error);
            } else {
                var content = data.split(',');
                var userInput = content[1].replace(/^"(.+(?="$))"$/, '$1');
                findSong(userInput);
                // console.log("log.txt was updated with default");
            }
        });

     } // end of doTheThing function