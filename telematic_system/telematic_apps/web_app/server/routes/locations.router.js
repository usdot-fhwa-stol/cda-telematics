module.exports = app => {
    const locations = require("../controllers/locations.controller");
    var router = require('express').Router();

    //Create a location
    router.post("/create", locations.create);

    //Retrieve all locations 
    router.get("/all", locations.findAll);

    app.use('/api/locations', router);

};