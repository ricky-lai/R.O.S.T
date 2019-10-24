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
        console.log("stockticker request");
        console.log(response);
        console.log("---------------------------------------------------------------");

        //grabbing the symbol from the first response of the search query
        var responseTicker = response.bestMatches[0]["1. symbol"];

        //display company name on html
        $("#stock-name").text(response.bestMatches[0]["1. symbol"] + " - " + response.bestMatches[0]["2. name"]);

        stockDataRequest(responseTicker);
        newsRequest(responseTicker);
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
        console.log("stockdata request");
        console.log(response);
        console.log("---------------------------------------------------------------");

        //changing the objects of objects into an array of objects
        var responseArray = [];
        for (item in response["Monthly Adjusted Time Series"]) {
            responseArray.push(response["Monthly Adjusted Time Series"][item]);
        }

        console.log("response array")
        console.log(responseArray);
        console.log("---------------------------------------------------------------");

        //storing 4 values in an array to show quarterly growth
        var quarterlyData = [];
        for (var i = 13; i > 0; i -= 4) {
            quarterlyData.push(responseArray[i]["5. adjusted close"]);
        }

        worthBuy(quarterlyData);
        console.log("Above this is the data array");
        console.log(quarterlyData);
        console.log("---------------------------------------------------------------");

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
        console.log("news api request");
        console.log(response);
        console.log("---------------------------------------------------------------");

        var articlesArray = [];
        // creating a loop to pull the top 3 articles
        for (var i = 0; i < 3; i++) {
            articlesArray.push(response.articles[i]);
        }
        console.log("articles array");
        console.log(articlesArray);
        console.log("---------------------------------------------------------------");
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

function displayChart(stockData) {
    //empty the current div the chart is in
    new Chart(document.getElementById("stock-graph"), {
        type: 'line',
        data: {
            labels: ["Q4", "Q3", "Q2", "Q1"],
            datasets: [{
                data: stockData,
                //line color
                borderColor: "#333333",
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
                text: 'Quarterly Stock Report'
            }
        }
    });
}

function worthBuy(yearlyData) {
    var percent = 0;

    percent = ((yearlyData[3] - yearlyData[0]) / yearlyData[0]) * 100;
    console.log("percent");
    console.log(percent);
    console.log("---------------------------------------------------------------");

    //check if the stock is worth buying or not
    if (percent >= 3) {
        $("#buy-sell").text("Buy");
    }
    else {
        $("#buy-sell").text("Don't Buy");
    }
}


//EVENT HANDLERS
////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    $("#search-button").on("click", function () {
        console.log("clickerd");
        event.preventDefault();
        console.log($("#search-bar").val().trim());
        if ($("#search-bar").length > 0) {
            stockTickerRequest($("#search-bar").val().trim());
        }

    });
});
$("#bigSearchButton").on("click", function () {
    //make this get the value of the main page and load next page with stored value
    // localStorage.setItem("defaultSearch", )
});


if (localStorage.getItem("defaultSearch") !== null) {
    stockTickerRequest(localStorage.getItem("defaultSearch"));
}

//FOR TESTING PURPOSES
stockTickerRequest("intel");

