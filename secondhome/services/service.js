const pool = require("../db/config");

module.exports = {
  create: (data, callBack) => {
    pool.query(
      "INSERT INTO property_listings (title, description, property_type, furnishing_status, bhk, price, location, bedrooms, bathrooms, size, year_built, amenities, image_urls ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.title,
        data.description,
        data.property_type,
        data.furnishing_status,
        data.bhk,
        data.price,
        data.location,
        data.bedrooms,
        data.bathrooms,
        data.size,
        data.year_built,
        data.amenities,
        data.image_urls,
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getProperties: (callBack) => {
    pool.query(
      `select * from property_listings`,
      [],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
};
