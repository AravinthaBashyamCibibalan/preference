// Import express for creating API's endpoints
const express = require("express");
const mongoose = require("mongoose");
const axios = require('axios');
const Schema = mongoose.Schema;
const bodyParser = require('body-parser');
const app = express();
const config = require('./config')
const tokenList = {}
const router = express.Router();
const cors = require('cors');
//const jwt = require('jsonwebtoken')
const port = 4000;
//var uri = "mongodb://localhost:27017/Preference";
var uri = "mongodb://richa:oV3aIrW22eJUFBs0Px45pxQt4iQvo6LymY6fOSr33hhqylHXbedHr06gjSSQyKAFK4J1mbN6WdaeACDbwtgSpg==@richa.mongo.cosmos.azure.com:10255/Preference?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@richa@"
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
const connection = mongoose.connection;
connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});
let Prefer = new Schema(
  {
    id: {                  // user id
      type: Number
    },
    role: {
      type: String
    },
    data: {                  //pref value
      type: Schema.Types.Mixed
    },
  },
  { collection: "Preference" }
);

var preference = mongoose.model("Preference", Prefer);
app.use(cors({
  origin: '*'
}));
app.use(cors({
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));
app.use(bodyParser.json())
app.use('/api', router)

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});
app.listen(process.env.port || 4000, () => {
  console.log(`Server is running on port ${config.port}.`);
  axios.get(config.wellKnownConfig, config.header).then(response => {
    config.openIdUrl.url = response.data.introspection_endpoint;
  });
});

router.get('/sample', (req, res) => {
 res.send('ok checked');
});

router.use(require('./tokenChecker')); // token checker is required after login only
// GET call
router.get('/fetchdata', (req, res) => {
  console.log('pref check', req.body);
  preference.find({}, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

router.get('/findpreference', function (request, res) {
  var id = request.query.id;
  preference.findOne({ id: id }, function (err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

// POST call
router.post('/insertdata', (req, res) => {
  var newdata = req.body;
  preference.insertMany(newdata, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});
// PUT/PATCH call
router.put('/updatedata', (req, res) => {
  var id = req.query.id;
  preference.updateOne({ id: id }, { data: req.body.data }, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});
