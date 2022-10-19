module.exports = app => {
    const testing_types = require("../controllers/testing_types.controller");
    var router = require('express').Router();

    //Retrieve all testing_types 
    router.get("/all", testing_types.findAll);

    app.use('/api/testing_types', router);

};