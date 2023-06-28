

$(document).ready(function () {


  // Load the Visualization API and the corechart package.
  google.charts.load('current', { 'packages': ['corechart', 'table'] });


  //Enable Tooltip
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

  function simulateTrades(startingBalance, winRate, takeProfit, stopLoss, numTrades, leverage, makerFee, takerFee) {
    // Initialize variables
    let balance = startingBalance;
    const trades = [];
    let stats = { winrate: 0, trades: 0, wins: 0, losses: 0, won: 0, lost: 0, fees: 0, profit: 0 };
    // Simulation loop
    for (let i = 0; i < numTrades; i++) {
      // Determine if the trade is a win or loss based on win rate
      const isWin = Math.random() < winRate / 100;
      // Calculate the trade result based on win or loss
      const pl = isWin ? takeProfit : -stopLoss;

      // Calculate the trade amount based on leverage
      const tradeAmount = balance * leverage;

      // Calculate the profit/loss for the trade
      const tradeProfitLoss = tradeAmount * pl / 100;

      // Calculate fee
      const fee = Number((Math.abs(tradeProfitLoss * makerFee) + Math.abs(tradeProfitLoss * takerFee)).toFixed(2));

      const pl_usd = tradeProfitLoss.toFixed(2) - fee
      // Update the balance after the trade
      balance += pl_usd;


      //stats
      stats.trades++;
      stats.fees += fee;
      if (isWin) {
        stats.wins++;
        stats.won += pl_usd;
      } else {
        stats.losses++;
        stats.lost += pl_usd;
      }

      // Store the trade result and remaining balance
      trades.push({ win: isWin, profitLoss: tradeProfitLoss, fee: fee, pl: pl, pl_usd: pl_usd.toFixed(2), balance: Number(balance.toFixed(2)) });

      if (balance < 1)
        break;
    }
    stats.winrate = (stats.wins / (stats.wins + stats.losses)) * 100;
    stats.profitrate = (balance.toFixed(2) / startingBalance * 100) - 100;
    stats.profit = Number(balance.toFixed(2)) - startingBalance;

    
    return { trades: trades, stats: stats };
  }

  function run() {

    const startingBalance = Number($("#startingBalance").val());
    const winRate = Number($("#winrate").val());
    const takeProfit = Number($("#targetProfit").val());
    const stopLoss = Number($("#stopLoss").val());
    const numTrades = Number($("#numberOfTrades").val());
    const leverage = Number($("#leverage").val());
    const makerFee = Number($("#makerFee").val());
    const takerFee = Number($("#takerFee").val());;
    const result = simulateTrades(startingBalance, winRate, takeProfit, stopLoss, numTrades, leverage, makerFee, takerFee);
    
    //console.table(result.trades);
    //console.log(result.stats);

    window.trades = result.trades;
    window.stats = result.stats;
    // Set a callback to run when the Google Visualization API is loaded.
    window.google.charts.setOnLoadCallback(chartTrades);
    $('#tradesTable > tbody').empty();
    for (let i = 0; i < result.trades.length; i++) {
      $('#tradesTable > tbody').append('<tr><th scope="row">' + (i + 1) + '</th>' +
        '<td style="'+(result.trades[i].win ? "color:#34b7a7;" : "color:#ef5350;") +'">' + (result.trades[i].win ? "Win" : "Loss") + '</td>' +
        '<td>' + result.trades[i].fee + ' USD</td>' +
        '<td style="'+(result.trades[i].win ? "color:#34b7a7;" : "color:#ef5350;") +'">' + result.trades[i].pl + ' % </td>' +
        '<td style="'+(result.trades[i].win ? "color:#34b7a7;" : "color:#ef5350;") +'">' + result.trades[i].pl_usd + ' USD</td>' +
        '<td>' + result.trades[i].balance + ' USD</td>' +
        '</tr>');
    }

    //stats
    $("#stat_winrate").html(stats.winrate.toFixed(1) + " <small>%</small>");
    $("#stat_trades").html(stats.trades + "");
    $("#stat_wins").html(stats.wins + "");
    $("#stat_losses").html(stats.losses + "");
    $("#stat_won").html(formatMoney(stats.won.toFixed(2)) + " <small>USD</small>");
    $("#stat_lost").html(formatMoney(stats.lost.toFixed(2)) + " <small>USD</small>");
    $("#stat_fees").html(formatMoney(stats.fees.toFixed(2)) + " <small>USD</small>");
    $("#stat_profitrate").html(stats.profitrate.toFixed(1) + " <small>%</small>");
    $("#stat_profit").html(formatMoney(stats.profit.toFixed(2), 2, ".", ",", " + ") + " <small>USD</small>");


  }

  run();

  $("#submit").click(run);


  function chartTrades() {

    const startingBalance = Number($("#startingBalance").val());
    const trades = window.trades;
    const profit = trades[trades.length - 1].balance
    const percent = (trades[trades.length - 1].balance / startingBalance * 100) - 100;

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Trades');
    data.addColumn('number', percent.toFixed(1) + ' % ( ' + profit + ' USD)');

    for (let i = 0; i < trades.length; i++) {
      data.addRow([i + 1, trades[i].balance]);
    }

    var chartwidth = $('#chart_div').parent().width();
    var options = {
      width: chartwidth,
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);
  }



  $("#exchange").change(function () {

    if ($(this).val() == 'bybit') {
      $('#makerFee').val(0.075);
      $('#takerFee').val(0.075);
    }

    if ($(this).val() == 'bitget') {
      $('#makerFee').val(0.05);
      $('#takerFee').val(0.05);
    }    

    if ($(this).val() == 'bybitnew') {
      $('#makerFee').val(0.06);
      $('#takerFee').val(0.06);
    }

    if ($(this).val() == 'bitfinex') {
      $('#makerFee').val(0.01);
      $('#takerFee').val(0.02);
    }

    if ($(this).val() == 'binance') {
      $('#makerFee').val(0.1);
      $('#takerFee').val(0.1);
    }

    if ($(this).val() == 'upbit') {
      $('#makerFee').val(0.25);
      $('#takerFee').val(0.25);
    }

    if ($(this).val() == 'huobi') {
      $('#makerFee').val(0.04);
      $('#takerFee').val(0.04);
    }

    if ($(this).val() == 'bithumb') {
      $('#makerFee').val(0.1);
      $('#takerFee').val(0.1);
    }

    if ($(this).val() == 'okex') {
      $('#makerFee').val(0.15);
      $('#takerFee').val(0.15);
    }

    if ($(this).val() == 'coinbase') {
      $('#makerFee').val(0.5);
      $('#takerFee').val(0.5);
    }

    if ($(this).val() == 'bitstamp') {
      $('#makerFee').val(0.25);
      $('#takerFee').val(0.25);
    }

    if ($(this).val() == 'kraken') {
      $('#makerFee').val(0.26);
      $('#takerFee').val(0.26);
    }
  });


  function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",", pos_sign = " ") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? " - " : pos_sign;

      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;

      return negativeSign +
        (j ? i.substr(0, j) + thousands : '') +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      console.log(e)
    }
  };

});


