const Event = require('../model/eventmodel');

const HistoryController = require('./HistoryController');
const GuestController = require('./GuestController');
const QueueController = require('./QueueController');

const EventController = {};
EventController.list = [];

EventController.addToList = (req, res) => {
  Event.create(req.body)
  .then(data => {res.json(data)})
  .catch(err => {res.end(err)})
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
