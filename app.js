var Clarifai = require("./clarifai_node.js"),
  express = require("express"),
  app = express(),
  server = require("http").Server(app),
  bodyParser = require("body-parser"),
  port = process.env.PORT || 5000;

app.use(bodyParser.json());

Clarifai.initAPI("YOUR_CLIENT_ID", "YOUR_CLIENT_SECRET");

function identifyClarifaiError(err) {
  if (typeof err["status_code"] === "string" && err["status_code"] === "TIMEOUT") {
    console.log("TAG request timed out");
  }
  else if (typeof err["status_code"] === "string" && err["status_code"] === "ALL_ERROR") {
    console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");       
  }
  else if (typeof err["status_code"] === "string" && err["status_code"] === "TOKEN_FAILURE") {
    console.log("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");       
  }
  else if (typeof err["status_code"] === "string" && err["status_code"] === "ERROR_THROTTLED") {
    console.log("Clarifai host is throttling this application.");       
  }
  else {
    console.log("TAG request encountered an unexpected error: ");
    console.log(err);       
  }
}

app.post("/examineImage", function(req, resp) {
  var imageURL = req.body.imageRequested;
  console.log("Response was ", imageURL);

  Clarifai.tagURL(imageURL, "Image from browser", commonResultHandler);

  function commonResultHandler(err, res) {
    if (err != null) {
      identifyClarifaiError(err);
    }
    else {
      if (typeof res["status_code"] === "string" && 
        (res["status_code"] === "OK" || res["status_code"] === "PARTIAL_ERROR")) {

        if (res["results"][0]["status_code"] === "OK") {
          console.log(JSON.stringify(res["results"][0]));
          var tags = res["results"][0].result["tag"]["classes"];
          resp.send(tags);
        }
        else {
          console.log("We had an error... Details: " +
            " docid=" + res.results[0].docid +
            " local_id=" + res.results[0].local_id + 
            " status_code="+res.results[0].status_code +
            " error = " + res.results[0]["result"]["error"]);

          resp.send("Error: " + res.results[0]["result"]["error"]);
        }
      }    
    }
  }
});

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

app.get(/^(.+)$/, function(req, res) {
  res.sendFile(__dirname + "/public/" + req.params[0]);
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

server.listen(port, function() {
  console.log("Listening on " + port);
});