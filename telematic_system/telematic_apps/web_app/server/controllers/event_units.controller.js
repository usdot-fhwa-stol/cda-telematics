const { events, Sequelize, locations, testing_types, units } = require("../models");
//Add unit to an event
exports.create = (req, res) => {
  if (!req.body.event_id || !req.body.unit_id) {
    res.status(400).send({
      message: "Content cannot be empty."
    });
    return;
  }

  var event_unit = {};
  event_unit.event_id = req.body.event_id;
  event_unit.unit_id = req.body.unit_id;
  // event_unit.end_time = Sequelize.literal('CURRENT_TIMESTAMP');
  // event_unit.start_time = Sequelize.literal('CURRENT_TIMESTAMP');
  event_unit.created_by = 1;
  //create an event_unit
  return events.findByPk(req.body.event_id)
    .then((event) => {
      if (!event) {
        console.log("event not found!");
        return null;
      }
      return units.findByPk(req.body.unit_id).then((unit) => {
        if (!unit) {
          console.log("unit not found!");
          return null;
        }

        event.addUnits(unit);
        res.status(200).send({ message: `added unit =${unit.unit_identifier} to event =${event.name}` });
        return event;
      });
    })
    .catch((err) => {
      console.error(">> Error while adding unit to event: ", err);
    });
}


// Delete an event unit with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;
  events.destroy({
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.status(200).send({ message: "Event unit was deleted successfully." })
    } else {
      res.status(404).send({ message: `Cannot delete event unit id =${id}. Maybe event unit was not found or request body was empty.` });
    }
  }).catch(err => {
    res.status(500).send({ message: `Error deleting event unit with id =${id}` })
  });

};