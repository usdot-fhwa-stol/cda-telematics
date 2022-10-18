module.exports = app => {
    const events = require("../controllers/events.controller");
    var router = require('express').Router();

    //Create an event
    router.post("/create", events.create);

    //Retrieve events by criteria: location, testing type, event name
    router.get("/all", events.findAll);

    //Update an event by id
    router.put('/update/:id', events.update);

    //Delete an event by id
    router.delete('/delete/:id', events.delete);

    app.use('/api/events', router);

};