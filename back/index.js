const express = require("express");
const app = express();
const { auth } = require("express-oauth2-jwt-bearer");

const port = process.env.PORT || 8090;

const jwtCheck = auth({
  audience: "http://localhost:8090/api",
  issuerBaseURL: "https://dev-e0yvfbl4ip7rdhmm.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

// enforce on all endpoints
app.use(jwtCheck);

app.get("/authorized", function (req, res) {
  res.send("Secured Resource");
});

app.listen(port);

console.log("Running on port ", port);
