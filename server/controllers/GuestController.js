const User = require('../model/usermodel');
const fs = require('fs');
const path = require('path');


const GuestController = {};

GuestController.storage = JSON.parse(fs.readFileSync(path.join(__dirname, '../cache/GuestCache.json')));

GuestController.addToList = (req, res) => {
  let currentUserID = req.cookies.google_id;
    User.findOne({google_id: currentUserID}, (err, user) => {
      if (err) { throw new Error(err); }
        GuestController.storage[req.body.event_id].push(user);
        fs.writeFileSync(path.join(__dirname, '../cache/GuestCache.json'), JSON.stringify(GuestController.storage, null, 2));
    });
    res.end();
};


module.exports = GuestController;
