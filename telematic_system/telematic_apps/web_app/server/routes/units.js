var express = require('express');
var router = express.Router();

var request = require('request');
const http = require('http');
const axios = require('axios');

const nats = require("nats")

router.get('/', function(req, res, next) {
    http.get('http://localhost:8080/getRegisteredUnits', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
      
        resp.on('end', () => {
          console.log(data)
          data = JSON.parse(data)

          for(let i = 0; i < data.length; i++) {
            data[i]["_link"] = "http://localhost:9020/units/" + data[i]["UnitId"]
          }

          res.send(data);
        });
      
      }).on("error", (err) => {

        res.status(404).send('Not Found');

        console.log("Error: " + err.message);
      });
});

router.get('/:id', function(req, res, next) {

  let id = req.params.id;

  http.get('http://localhost:8080/requestAvailableTopics?UnitId=' + id, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
    
      resp.on('end', () => {

        data = JSON.parse(data)

        for(let i = 0; i < data["topics"].length; i++) {
          data["topics"][i]["_link"] = "http://localhost:9020/units/" + id + "/requestTopic?topic=" + data["topics"][i]["name"]
        }

        res.send(data["topics"]);
      });
    
    }).on("error", (err) => {

      res.status(404).send('Not Found');

      console.log("Error: " + err.message);
    });

});

router.get('/:id/requestTopic', async function(req, res, next) {

  let id = req.params.id;
  let data = JSON.parse("{}")
  data["UnitId"] = id

  let topics = []

  topics.push(req.query.topic)

  data["topics"] = topics

  axios.post('http://localhost:8080/publishSelectedTopics', data)
  .then(res => {
    console.log(`statusCode: ${res.status}`);
  })
  .catch(error => {
    console.error(error);
  });

  res.status(202).send("Successful!");

});

module.exports = router;
