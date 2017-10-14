'use strict';

var _sourceMapSupport = require('source-map-support');

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

require('babel-polyfill');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mongodb = require('mongodb');

var _hike = require('./hike.js');

var _hike2 = _interopRequireDefault(_hike);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_sourceMapSupport2.default.install();


const app = (0, _express2.default)();
app.use(_express2.default.static('static'));
app.use(_bodyParser2.default.json());

let db;

app.get('/api/hikes', (req, res) => {
  db.collection('hikes').find().toArray().then(hikes => {
    const metadata = { total_count: hikes.length };
    res.json({ _metadata: metadata, records: hikes });
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.post('/api/hikes', (req, res) => {
  const newHike = req.body;
  newHike.created = new Date();

  const err = _hike2.default.validateHike(newHike);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('hikes').insertOne(_hike2.default.cleanupHike(newHike)).then(result => db.collection('hikes').find({ _id: result.insertedId }).limit(1).next()).then(savedHike => {
    res.json(savedHike);
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.get('/api/hikes/:id', (req, res) => {
  let hikeId;
  try {
    hikeId = new _mongodb.ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid hike ID format: ${error}` });
    return;
  }

  db.collection('hikes').find({ _id: hikeId }).limit(1).next().then(hike => {
    if (!hike) res.status(404).json({ message: `No such hike: ${hikeId}` });else res.json(hike);
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.put('/api/hikes/:id', (req, res) => {
  let hikeId;
  try {
    hikeId = new _mongodb.ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid hike ID format: ${error}` });
    return;
  }

  const hike = req.body;
  delete hike._id;

  const err = _hike2.default.validateHike(hike);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('hikes').updateOne({ _id: hikeId }, _hike2.default.convertHike(hike)).then(() => db.collection('hikes').find({ _id: hikeId }).limit(1).next()).then(savedHike => {
    res.json(savedHike);
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.delete('/api/hikes/:id', (req, res) => {
  let hikeId;
  try {
    hikeId = new _mongodb.ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid hike ID format: ${error}` });
    return;
  }

  db.collection('hikes').deleteOne({ _id: hikeId }).then(deleteResult => {
    if (deleteResult.result.n === 1) res.json({ status: 'OK' });else res.json({ status: 'Warning: object not found' });
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.get('*', (req, res) => {
  res.sendFile(_path2.default.resolve('static/index.html'));
});

_mongodb.MongoClient.connect('mongodb://localhost/hikeDB').then(connection => {
  db = connection;
  app.listen(3000, () => {
    console.log('App started on port 3000');
  });
}).catch(error => {
  console.log('ERROR:', error);
});
//# sourceMappingURL=server.js.map