const Event = require('../model/eventmodel');

const HistoryController = require('./HistoryController');
const GuestController = require('./GuestController');
const QueueController = require('./QueueController');

const EventController = {};

EventController.addToList = (req, res) => {
  console.log('user obj: ', req.user);
  Event.create(req.body)
  .then(data => {
    console.log('Created New Event: ', data);
    HistoryController.storage[data._id] = [];
    QueueController.storage[data._id] = [];
    GuestController.storage[data._id] = [req.user.username];
    res.json(data);
  })
  .catch(err => {
    console.log('Error creating Event: ', err);
    res.json(err);
  })
}

EventController.joinEvent = (req, res, next) => {
  Event.findOne({eventName: req.body.eventName})
  .where('eventPassword').equals(req.body.eventPassword)
  .then(event => {
    console.log('setting event_id on req.body', event);
    req.body["event_id"] = event._id;
    const responseObj = {
      event: event,
      history: HistoryController.storage[event._id],
      songs: QueueController.storage[event._id],
      guests: GuestController.storage[event._id]
    };
    console.log('response:', responseObj);
    res.send(JSON.stringify(responseObj));
    next();
  })
  .catch(err => {
    res.send(JSON.stringify(err));
    next();
  });
}


EventController.joinEvent = (req, res, next) => {
  Event.findOne({eventName: req.body.eventName})
  .where('eventPassword').equals(req.body.eventPassword)
  .then(event => req.body["event_id"] = event._id)
  .then(event => res.send(JSON.stringify({
    event,
    HistoryController.list[event._id],
    QueueController.list[event._id],
    GuestController.list[event._id]
  }))
  .catch(err => res.send(err))
  next()
}

module.exports = EventController;
