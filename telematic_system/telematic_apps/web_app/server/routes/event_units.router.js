module.exports = app => {
    const event_unit = require("../controllers/event_units.controller");
    const events = require("../controllers/events.controller");
    var router = require('express').Router();

    //Assign unit to an event
    router.post('/create', event_unit.create)

    //Unassign unit to an event
    router.delete('/delete/:id', event_unit.delete)

    app.use('/api/event_units', router);

};