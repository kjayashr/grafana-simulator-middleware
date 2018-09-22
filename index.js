var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();

var PubNub = require('pubnub');

var created_time = Date.now();
var testmessage = "Who voted him"
/*PubNub invocation*/
var pubnub = new PubNub({

    subscribe_key: 'sub-c-78806dd4-42a6-11e4-aed8-02ee2ddab7fe'
});
console.log("status check :: 14");
pubnub.addListener({
    message: function(message) {

        console.log("status check :: 18");
        if( message.message.text.toString().includes("#WhyIDidntReport") )
        {
            console.log("status check :: 20");
            let ts = message.message.created_at;
            let unix_seconds = ((new Date(ts)).getTime()) /1000;
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>UPDATE>>>>>>>>>>>>"+unix_seconds);
            created_time = unix_seconds;
            console.log("TEST MESSAGE: BEFORE:: "+ testmessage);


            testmessage = message.message.text.toString();

            console.log("TEST MESSAGE: BEFORE AFTER:: "+ testmessage);
            annotations.push( { annotation: annotation, "title": testmessage, "time": Date.now(), text: "teeext", tags: "taaags" });
        }
    }
});

pubnub.subscribe({
    channels: ['pubnub-twitter']
});

console.log("status check :: 30");
app.use(bodyParser.json());

var timeserie = require('./series');
var countryTimeseries = require('./country-series');

var now = Date.now();

for (var i = timeserie.length -1; i >= 0; i--) {
    var series = timeserie[i];
    var decreaser = 0;
    for (var y = series.datapoints.length -1; y >= 0; y--) {
        series.datapoints[y][1] = Math.round((now - decreaser) /1000) * 1000;
        decreaser += 50000;
    }
}

var annotation = {
    name : "annotation name",
    enabled: true,
    datasource: "generic datasource",
    showLine: true,
}

var annotations = [
];

var tagKeys = [
    {"type":"string","text":"Country"}
];

var countryTagValues = [
    {'text': 'SE'},
    {'text': 'DE'},
    {'text': 'US'}
];
/*
var now = Date.now();
var decreaser = 0;
for (var i = 0;i < annotations.length; i++) {
  var anon = annotations[i];

  anon.time = (now - decreaser);
  decreaser += 1000000
}
*/
var table =
    {
        columns: [{text: 'Time', type: 'time'}, {text: 'Country', type: 'string'}, {text: 'Number', type: 'number'}],
        values: [
            [ 1234567, 'SE', 123 ],
            [ 1234567, 'DE', 231 ],
            [ 1234567, 'US', 321 ],
        ]
    };

function setCORSHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}


var now = Date.now();
var decreaser = 0;
for (var i = 0;i < table.values.length; i++) {
    var anon = table.values[i];

    anon[0] = (now - decreaser);
    decreaser += 1000000
}

app.all('/', function(req, res) {
    setCORSHeaders(res);
    res.send('I have a quest for you!');
    res.end();
});

app.all('/search', function(req, res){
    setCORSHeaders(res);
    var result = [];
    _.each(timeserie, function(ts) {
        result.push(ts.target);
    });

    res.json(result);
    res.end();
});

app.all('/annotations', function(req, res) {
    setCORSHeaders(res);
    console.log(req.url);
    console.log(req.body);

    res.json(annotations);
    res.end();
});

app.all('/query', function(req, res){
    setCORSHeaders(res);
    console.log(req.url);
    console.log(req.body);

    var tsResult = [];
    let fakeData = timeserie;

    if (req.body.adhocFilters && req.body.adhocFilters.length > 0) {
        fakeData = countryTimeseries;
    }

    _.each(req.body.targets, function(target) {
        if (target.type === 'table') {
            tsResult.push(table);
        } else {
            var k = _.filter(fakeData, function(t) {
                return t.target === target.target;
            });

            _.each(k, function(kk) {
                tsResult.push(kk)
            });
        }
    });

    res.json(tsResult);
    res.end();
});

app.all('/tag[\-]keys', function(req, res) {
    setCORSHeaders(res);
    console.log(req.url);
    console.log(req.body);

    res.json(tagKeys);
    res.end();
});

app.all('/tag[\-]values', function(req, res) {
    setCORSHeaders(res);
    console.log(req.url);
    console.log(req.body);

    if (req.body.key == 'City') {
        res.json(cityTagValues);
    } else if (req.body.key == 'Country') {
        res.json(countryTagValues);
    }
    res.end();
});

app.listen(3333);

console.log("Server is listening to port 3333");
