import SourceMapSupport from 'source-map-support';
SourceMapSupport.install();
import 'babel-polyfill';

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient, ObjectId } from 'mongodb';
import Hike from './hike.js';

const app = express();
app.use(express.static('static'));
app.use(bodyParser.json());

let db;

app.get('/api/hikes', (req, res) => {
  db.collection('hikes').find().toArray()
  .then(hikes => {
    const metadata = { total_count: hikes.length };
    res.json({ _metadata: metadata, records: hikes });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.post('/api/hikes', (req, res) => {
  const newHike = req.body;
  newHike.created = new Date();

  const err = Hike.validateHike(newHike);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('hikes').insertOne(Hike.cleanupHike(newHike)).then(result =>
    db.collection('hikes').find({ _id: result.insertedId }).limit(1)
    .next()
  )
  .then(savedHike => {
    res.json(savedHike);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.get('/api/hikes/:id', (req, res) => {
  let hikeId;
  try {
    hikeId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid hike ID format: ${error}` });
    return;
  }

  db.collection('hikes').find({ _id: hikeId }).limit(1)
  .next()
  .then(hike => {
    if (!hike) res.status(404).json({ message: `No such hike: ${hikeId}` });
    else res.json(hike);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.put('/api/hikes/:id', (req, res) => {
  let hikeId;
  try {
    hikeId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid hike ID format: ${error}` });
    return;
  }

  const hike = req.body;
  delete hike._id;

  const err = Hike.validateHike(hike);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('hikes').updateOne({ _id: hikeId }, Hike.convertHike(hike)).then(() =>
    db.collection('hikes').find({ _id: hikeId }).limit(1)
    .next()
  )
  .then(savedHike => {
    res.json(savedHike);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.delete('/api/hikes/:id', (req, res) => {
  let hikeId;
  try {
    hikeId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid hike ID format: ${error}` });
    return;
  }

  db.collection('hikes').deleteOne({ _id: hikeId }).then((deleteResult) => {
    if (deleteResult.result.n === 1) res.json({ status: 'OK' });
    else res.json({ status: 'Warning: object not found' });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('static/index.html'));
});

MongoClient.connect('mongodb://localhost/hikeDB').then(connection => {
  db = connection;
  app.listen(3000, () => {
    console.log('App started on port 3000');
  });
}).catch(error => {
  console.log('ERROR:', error);
});