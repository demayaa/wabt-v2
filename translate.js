var unirest = require("unirest");

var req = unirest("POST", "https://screenshotapi-net.p.rapidapi.com/screenshot");

req.query({
	"token": "CYDUJDYAINYKYLBD2X2CATHSJSGQLHMP"
});

req.headers({
	"content-type": "application/json",
	"x-rapidapi-key": "696ee93b9amsh5585a5f21cc930dp1e255cjsna85a162441f7",
	"x-rapidapi-host": "screenshotapi-net.p.rapidapi.com",
	"useQueryString": true
});

req.type("json");
req.send({
	"url": "https://www.tradingview.com/chart/?symbol=BINANCE%3ATRXUSDT",
	"fresh": true,
	"output": "json",
	"full_page": true
});

req.end(function (res) {
	if (res.error) throw new Error(res.error);

	console.log(res.body);
});