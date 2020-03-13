// home.js

var appId = 'e2eecd8870256afbed9e6f527ba2364d';
var country = 'us';

$(document).ready(function () {
    $('#submit').click(function (e) {
        var zipcode = $('#zipcode').val();

        // Switch units to inputs for the API.
        var units;
        if ($('#units').val() == 'Imperial') units = 'imperial';
        if ($('#units').val() == 'Metric') units = 'metric';

        // Check to see if Zip is a 5-digit number before running.
        if (checkZipcode(zipcode)) {
            loadCurrent(zipcode, units);
            loadForecast(zipcode, units);
            showContent();
        }
    });
});

function checkZipcode(zipcode) {
    if (/^[0-9]{5}$/.test(zipcode) == false) {
        // Add error to list
        $('#errors')
            .append($('<li>Zipcode: Please enter a 5-digit zipcode.</li>'))
            .attr({ class: 'list-group-item list-group-item-danger' });
        return false;
    }
    // Clear errors if valid
    $('#errors').empty();
    return true;
}

// Show Current Condition and Five-Day Forecast
function showContent() {
    $('#content').show();
}

// Get temperture unit abbreviation
function getUnit(units) {
    if (units == 'imperial') return 'F';
    if (units == 'metric') return 'C';
}

function loadCurrent(zipcode, units) {
    $.ajax({
        type: 'GET',
        // weather?zip=,country&appid=&units=
        url: 'http://api.openweathermap.org/data/2.5/weather?zip=' + zipcode + ',' + country + '&appid=' + appId + '&units=' + units,
        success: function (data, status) {
            $('#city').text('Current Conditions in ' + data.name);
            $('#current-icon').attr('src', 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png');
            $('#current-main').text(data.weather[0].main);
            $('#current-description').text(data.weather[0].description);
            $('#current-temperture').text(data.main.temp + ' \u00B0' + getUnit(units));
            $('#current-humidity').text(data.main.humidity + '%');
            $('#current-wind').text(data.wind.speed + 'mph ' + data.wind.deg + '\u00B0');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('#errors')
                .append('<li>Error: ' + thrownError + '</li>')
                .attr({ class: 'list-group-item list-group-item-danger' });
        }
    });
}

function loadForecast(zipcode, units) {
    // forecast?zip=,country&appid=&units=
    $.ajax({
        type: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/forecast?zip=' + zipcode + ',' + country + '&appid=' + appId + '&units=' + units,
        success: function (array, status) {
            var temp_max = array.list[0].main.temp_max;
            var temp_min = array.list[0].main.temp_min;
            var start_ticks = array.list[0].dt * 1000;
            var start_dt = new Date(start_ticks);
            var start_day = start_dt.getDate();

            // Returns 40 3-hour intervals
            for (var i = 0; i < 40; i++) {
                // Get selected date
                var ticks = array.list[i].dt * 1000;
                var dt = new Date(ticks);
                var day = dt.getDate();

                // If it's a new day, display the previous one
                if (day != start_day) {
                    $('#day' + (i / 8) + '-high').text(temp_max + ' ' + getUnit(units));
                    $('#day' + (i / 8) + '-low').text(temp_min + ' ' + getUnit(units));

                    // Offset min and max
                    temp_max -= 100;
                    temp_min += 100;

                    start_day = day;
                }

                // Check and record min and max
                if (array.list[i].main.temp_max > temp_max) {
                    temp_max = array.list[i].main.temp_max;
                }
                if (array.list[i].main.temp_min < temp_min) {
                    temp_min = array.list[i].main.temp_min;
                }

                // Every 8th 3-hour interval set other date information
                if (i % 8 == 0) {
                    $('#day' + (i / 8) + '-date').text(dt.toDateString());
                    $('#day' + (i / 8) + '-icon').attr('src', 'http://openweathermap.org/img/wn/' + array.list[i].weather[0].icon + '.png');
                    $('#day' + (i / 8) + '-description').text(array.list[i].weather[0].description);
                    $('#day' + (i / 8) + '-high').text(temp_max.toFixed(2) + ' ' + getUnit(units));
                    $('#day' + (i / 8) + '-low').text(temp_min.toFixed(2) + ' ' + getUnit(units));
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('#errors')
                .append('<li>Error: ' + thrownError + '</li>')
                .attr({ class: 'list-group-item list-group-item-danger' });
        }
    });
}