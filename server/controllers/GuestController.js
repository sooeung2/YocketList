const GuestController = {};
const User = require('../model/usermodel');

GuestController.list = {};

GuestController.addToList = (req, res) => {
  let currentUserID = req.cookies.google_id;
    User.findOne({google_id: currentUserID}, (err, user) => {
      if (err) { throw new Error(err); }
        GuestController.list[req.body.event_id].push(user);
    });
    res.end();
};


module.exports = GuestController;
