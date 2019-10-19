//ALL AJAX CALLS
////////////////////////////////////////////////////////////////////

//call to alpha vantage to get the stock ticker
function stockTickerRequest(search) {
    //FOR TESTING PURPOSES
    search = "google";

    var apiKey = "TFCCMLBLD91O6OFT";
    var queryURL = "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + search + "&apikey=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log("stockticker request");
        console.log(response);

        //grabbing the symbol from the first response of the search query
        var responseTicker = response.bestMatches[0]["1. symbol"]

        stockDataRequest(responseTicker);
        newsRequest(responseTicker);
    });
}

//call to alpha vantage to get the historical data of the stocks
function stockDataRequest(ticker) {
    var apiKey = "TFCCMLBLD91O6OFT";
    var queryURL = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=" + ticker + "&apikey=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log("stockdata request");
        console.log(response);

        //changing the objects of objects into an array of objects
        var responseArray = Object.keys(response["Monthly Adjusted Time Series"]);
    });
}

// Calls to newsAPI for top articles related to the search
function newsRequest(tickerSearch) {
    var apiKey = "44ec6ee2a9c74c3dbe590b43546a857c";
    var queryURL = "https://newsapi.org/v2/everything?q=" + tickerSearch + "&apiKey=" + apiKey;
    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);

        var articlesArray = [];
        // creating a loop to pull the top 3 articles
        for (var i = 0; i < 3; i++) {
            articlesArray.push(response.articles[i]);
        }
        console.log(articlesArray);
        displayArticles(articlesArray);
    });
}



//ALL FUNCTIONS
////////////////////////////////////////////////////////////////////

//append article cards to display
function displayArticles(articles) {
    var title = "";
    var description = "";
    var publishedDate = "";
    var source = "";
    var newsUrl = "";

    for (var i = 0; articles.length; i++) {
        title = articles[i].title;
        description = articles[i].description;
        publishedDate = articles[i].publishedAt.substring(0, 10);
        source = articles[i].source.name;
        newsUrl = articles[i].url;

    }
}

function displayChart(data) {
    //empty the current div the chart is in
    new Chart(document.getElementById("myChart"), {
        type: 'line',
        data: {
            labels: ["Q1", "Q2", "Q3", "Q4"],
            datasets: [{
                data: [10, 20, 50, 40],
                //line color
                borderColor: "#333333",
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



//BUTTON HANDLERS
////////////////////////////////////////////////////////////////////
$("#search-button").on("click", function () {
    stockTickerRequest($("#search-bar").text().trim());
});

//FOR TESTING PURPOSES
stockTickerRequest();
displayChart();