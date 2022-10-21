module.exports = app => {
    const default_event_topics = require("../controllers/default_event_topics.controller");
    var router = require('express').Router();

    //Create a default_event_topics
    router.post("/create", default_event_topics.create);

    //Retrieve default_event_topics by criteria: event_id and unit_identifier
    router.get("/all", default_event_topics.findAll);

    app.use('/api/default_event_topics', router);

};