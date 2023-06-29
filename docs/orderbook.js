

//https://api.binance.com/api/v3/depth?limit=100&symbol=BTCUSDT
//
$(function () {


  $.get("https://api.binance.com/api/v3/exchangeInfo", function (data) {
    $(".result").html(data);
    let symbols = data.symbols;

    let selected_symbol = "BTCUSDT";
    result = window.location.search.split("=");
    if (result.length >= 1 && result[0] == "?symbol")
      selected_symbol = result[1];

    for (var i = 0; i < symbols.length; i++) {
      $('#symbols').append($('<option>', {
        value: symbols[i].symbol,
        text: symbols[i].symbol
      }));
      if (symbols[i].symbol == selected_symbol) {
        $("#symbols option:last").attr("selected", "selected");
      }
    }
  });

});


//<a href="http://www.amcharts.com" title="JavaScript charts" style="position: absolute; text-decoration: none; color: rgb(231, 231, 231); font-family: Verdana; font-size: 11px; opacity: 0.7; display: block; left: 76px; top: 25px;">JS chart by amCharts</a>

function makeChart() {
  return AmCharts.makeChart("chartdiv", {
    "hideCredits": true,
    "type": "serial",
    "theme": "dark",
    "dataLoader": {
      "url": "https://api.binance.com/api/v3/depth?limit=5000&symbol=" + global_symbol,
      "format": "json",
      "reload": 5,
      "postProcess": function (data) {

        // Function to process (sort and calculate cummulative volume)
        function processData(list, type, desc) {

          // Convert to data points
          for (var i = 0; i < list.length; i++) {

            list[i] = {
              value: Number(list[i][0]),
              volume: Number(list[i][1]),
            }
          }

          // Sort list just in case
          list.sort(function (a, b) {
            if (a.value > b.value) {
              return 1;
            }
            else if (a.value < b.value) {
              return -1;
            }
            else {
              return 0;
            }
          });

          // Calculate cummulative volume
          if (desc) {
            for (var i = list.length - 1; i >= 0; i--) {
              if (i < (list.length - 1)) {
                list[i].totalvolume = list[i + 1].totalvolume + list[i].volume;
              }
              else {
                list[i].totalvolume = list[i].volume;
              }
              var dp = {};
              dp["value"] = list[i].value;
              dp[type + "volume"] = list[i].volume;
              dp[type + "totalvolume"] = list[i].totalvolume;
              res.unshift(dp);
            }
          }
          else {
            for (var i = 0; i < list.length; i++) {
              if (i > 0) {
                list[i].totalvolume = list[i - 1].totalvolume + list[i].volume;
              }
              else {
                list[i].totalvolume = list[i].volume;
              }
              var dp = {};
              dp["value"] = list[i].value;
              dp[type + "volume"] = list[i].volume;
              dp[type + "totalvolume"] = list[i].totalvolume;
              res.push(dp);
            }
          }

        }

        // Init
        var res = [];
        let filter = $('#filter').val();
        if (filter != "none") //filter
        {
          processData(data.bids.filter(item => Number(item[1]) > Number(filter)), "bids", true);
          processData(data.asks.filter(item => Number(item[1]) > Number(filter)), "asks", false);
        }
        else {
          processData(data.bids, "bids", true);
          processData(data.asks, "asks", false);
        }



        //console.log(res);
        return res;
      }
    },
    "graphs": [{
      "id": "bids",
      "fillAlphas": 0.1,
      "lineAlpha": 1,
      "lineThickness": 2,
      "lineColor": "#34b7a7",
      "type": "step",
      "valueField": "bidstotalvolume",
      "balloonFunction": balloon
    }, {
      "id": "asks",
      "fillAlphas": 0.1,
      "lineAlpha": 1,
      "lineThickness": 2,
      "lineColor": "#ef5350",
      "type": "step",
      "valueField": "askstotalvolume",
      "balloonFunction": balloon
    }, {
      "lineAlpha": 0,
      "fillAlphas": 0.2,
      "lineColor": "#777",
      "type": "column",
      "clustered": false,
      "valueField": "bidsvolume",
      "showBalloon": false
    }, {
      "lineAlpha": 0,
      "fillAlphas": 0.2,
      "lineColor": "#777",
      "type": "column",
      "clustered": false,
      "valueField": "asksvolume",
      "showBalloon": false
    }],
    "categoryField": "value",
    "chartCursor": {},
    "balloon": {
      "textAlign": "left"
    },
    "valueAxes": [{
      "title": "Volume"
    }],
    "categoryAxis": {
      "title": "Price ( " + global_symbol + " )",
      "minHorizontalGap": 100,
      "startOnAxis": true,
      "showFirstLabel": false,
      "showLastLabel": false
    },
    "export": {
      "enabled": false
    }
  });

}

let global_symbol = "BTCUSDT";
let global_timeframe = "BTCUSDT";
result = window.location.search.split("=");
if (result.length >= 1 && result[0] == "?symbol")
  global_symbol = result[1];
let chart = makeChart();

$('#symbols').on('change', function () {
  window.location.replace(window.location.origin + window.location.pathname + "?symbol=" + this.value);
});

$('#symbols').on('change', function () {
  global_timeframe = Number(this.value);
});


function balloon(item, graph) {
  var txt;
  if (graph.id == "asks") {
    txt = "Ask: <strong>" + formatNumber(item.dataContext.value, graph.chart, 4) + "</strong><br />"
      + "Total volume: <strong>" + formatNumber(item.dataContext.askstotalvolume, graph.chart, 4) + "</strong><br />"
      + "Volume: <strong>" + formatNumber(item.dataContext.asksvolume, graph.chart, 4) + "</strong>";
  }
  else {
    txt = "Bid: <strong>" + formatNumber(item.dataContext.value, graph.chart, 4) + "</strong><br />"
      + "Total volume: <strong>" + formatNumber(item.dataContext.bidstotalvolume, graph.chart, 4) + "</strong><br />"
      + "Volume: <strong>" + formatNumber(item.dataContext.bidsvolume, graph.chart, 4) + "</strong>";
  }
  return txt;
}

function formatNumber(val, chart, precision) {
  return AmCharts.formatNumber(
    val,
    {
      precision: precision ? precision : chart.precision,
      decimalSeparator: chart.decimalSeparator,
      thousandsSeparator: chart.thousandsSeparator
    }
  );
}