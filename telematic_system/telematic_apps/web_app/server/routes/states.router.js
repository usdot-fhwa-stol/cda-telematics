module.exports = app => {
    const states = require("../controllers/states.controller");
    var router = require('express').Router();

    //Retrieve all states 
    router.get("/all", states.findAll);

    app.use('/api/states', router);

};