const { create, getProperties } = require("../services/service");

module.exports = {
  createProperty: (req, res) => {
    const body = req.body;
    console.log(body);
    create(body, (err, results) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to insert property data" });
      } 
      else {
        return res.status(201).json({
            message: "Property data inserted successfully",
            data:results,
            propertyId: results.insertId,
          });
      }
    });
  },
  getProperties: (req, res) => {
    getProperties((err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
};
