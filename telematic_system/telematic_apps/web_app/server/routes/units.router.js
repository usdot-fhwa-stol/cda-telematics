module.exports = app => {
    const units = require("../controllers/units.controller");
    var router = require('express').Router();

    //Create a unit
    router.post("/create", units.create);

    //Retrieve all units
    router.get("/all", units.findAll);

    app.use('/api/units', router);

};