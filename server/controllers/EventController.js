const Event = require('../model/eventmodel');

const EventController = {};
EventController.list = [];

EventController.addToList = (req, res) => {
  Event.create(req.body)
  .then(data => {
    console.log('Created New Event: ', data);
    res.json(data);
  })
  .catch(err => {
    console.log('Error creating Event: ', err);
    res.json(err);
  })
}

module.exports = EventController;
