//ALL AJAX CALLS
////////////////////////////////////////////////////////////////////

//call to alpha vantage to get the stock ticker
function stockTickerRequest(search) {

    var apiKey = "TFCCMLBLD91O6OFT";
    var queryURL = "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + search + "&apikey=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        //check if there is no response
        if (response.bestMatches.length === 0) {
            displayError();
        }

        else {
            //grabbing the symbol from the first response of the search query
            var responseTicker = response.bestMatches[0]["1. symbol"];

            //display company name on html
            $("#stock-name").text(response.bestMatches[0]["1. symbol"] + " - " + response.bestMatches[0]["2. name"]);

            stockDataRequest(responseTicker);
            newsRequest(responseTicker);
        }
    });
}

//calls to alpha vantage to get the historical data of the stocks
function stockDataRequest(ticker) {

    var apiKey = "TFCCMLBLD91O6OFT";
    var queryURL = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=" + ticker + "&apikey=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //changing the objects of objects into an array of objects
        var responseArray = [];
        for (item in response["Monthly Adjusted Time Series"]) {
            responseArray.push(response["Monthly Adjusted Time Series"][item]);
        }

        //storing 4 values in an array to show quarterly growth
        var quarterlyData = [];
        for (var i = 13; i > 0; i -= 4) {
            quarterlyData.push(responseArray[i]["5. adjusted close"]);
        }

        //check if the stock is worth buying and display it
        worthBuy(quarterlyData);

        //passing through the data we retrieved to the displayChart function to show the chart on screen
        displayChart(quarterlyData);
        displayStats(responseArray[0]);


    });
}

//calls to newsAPI for top articles related to the search
function newsRequest(tickerSearch) {

    var apiKey = "44ec6ee2a9c74c3dbe590b43546a857c";
    var queryURL = "https://newsapi.org/v2/everything?q=" + tickerSearch + "&apiKey=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        var articlesArray = [];
        // creating a loop to pull the top 3 articles
        for (var i = 0; i < 3; i++) {
            articlesArray.push(response.articles[i]);
        }

        displayArticles(articlesArray);

    });
}

//ALL FUNCTIONS
////////////////////////////////////////////////////////////////////

//append article cards to display
function displayArticles(articles) {
    var title = "";
    var publishedDate = "";
    var source = "";
    var newsUrl = "";
    var newsImage = "";

    //empty current article display
    $("#article-display").empty();

    for (var i = 0; articles.length; i++) {
        title = articles[i].title;
        publishedDate = articles[i].publishedAt.substring(0, 10);
        source = articles[i].source.name;
        newsUrl = articles[i].url;
        newsImage = articles[i].urlToImage;

        $("#article-display").append("<div class='card'>" +
            "<img class='card-img-top' src=" + newsImage + " alt=" + title + " width='385' height='214'>" +
            "<div class='card-body'>" +
            "<h5 class='card-title'>" +
            "<a href='" + newsUrl + "' target='_blank' class='card-link'>" + title + "</a>" +
            "</h5>" +
            "<p class='card-text'>" + source + "</p>" +
            "<p>" + publishedDate + "</p>" +
            "</div>" +
            "</div>");
    }
}

//get the stats from the api request and display them on the page
function displayStats(current) {
    var open = "";
    var high = "";
    var low = "";

    open = current["1. open"];
    high = current["2. high"];
    low = current["3. low"];

    $("#open-close").text("$" + open.substring(0, open.length - 2));
    $("#todays-high").text("$" + high.substring(0, open.length - 2));
    $("#todays-low").text("$" + low.substring(0, open.length - 2));
}

//display the chart on the page with the data from the api
function displayChart(stockData) {
    new Chart(document.getElementById("stock-graph"), {
        type: 'line',
        data: {
            labels: ["Q4", "Q3", "Q2", "Q1"],
            datasets: [{
                data: stockData,
                //line color
                borderColor: "#2c698d",
                backgroundColor: "#2c698d",
                pointBackgroundColor: "#000000",
                pointBorderColor: "#000000",
                //fills the area beneath the line
                fill: true
                
            }
            ]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Stock Report Over Past Year'
            }
        }
    });
}

//check if the stock has over 3 percent yearly growth and display the result of that calc
function worthBuy(yearlyData) {
    var percent = 0;

    percent = ((yearlyData[3] - yearlyData[0]) / yearlyData[0]) * 100;

    //check if the stock is worth buying or not
    if (percent >= 3) {
        $("#buy-sell").text("Buy");
        $("#buy-sell").css("color", "lightgreen");
    }
    else {
        $("#buy-sell").text("Don't Buy");
        $("#buy-sell").css("color", "tomato");
    }
}

//display error if search is invalid
function displayError() {
    $("#open-close").text("None");
    $("#todays-high").text("None");
    $("#todays-low").text("None");
    $("#buy-sell").text("None");
    $("#buy-sell").css("color", "black");
    $("#stock-name").text("No Results");
}

//EVENT HANDLERS
////////////////////////////////////////////////////////////////////

//waiting for the page to be fully loaded
$(document).ready(function () {

    //search button on the search results page
    $("#search-button").on("click", function () {
        event.preventDefault();
        if ($("#search-bar").length > 0) {
            stockTickerRequest($("#search-bar").val().trim());
        }
    });

    //search button on index.html
    $("#big-search-button").on("click", function () {
        //make this get the value of the main page and load next page with stored value
        event.preventDefault();
        var search = $("#big-search-bar").val().trim();
        if (search.length === 0) {
            search = "Google"
        }

        var value = "?para1=" + search;
        document.location.assign("search-results.html" + value);
    });

    //make form not submit on enter press
    $("form").on("keypress", function (e) {
        if (e.which == 13) {
            event.preventDefault();
        }
    });
});



// take the search from the mainpage is use it on the results page
if ($("body").hasClass("resultspage")) {
    var param = "";
    param = decodeURIComponent(window.location.search);
    stockTickerRequest(param.substring(7, param.length));
}