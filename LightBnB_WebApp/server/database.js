const { Pool } = require('pg');

const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb"
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1;
  `;
  const values = [email];

  return pool
    .query(query, values)
    .then(res => res.rows[0] || null)
    .catch(err => console.error('Error executing query', err.stack));
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const query = `
    SELECT *
    FROM users
    WHERE id = $1;
  `;
  const values = [id];

  return pool
    .query(query, values)
    .then(res => res.rows[0] || null)
    .catch(err => console.error('Error executing query', err.stack));
};

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [user.name, user.email, user.password];

  return pool
    .query(query, values)
    .then(res => res.rows[0])
    .catch(err => console.error('Error executing query', err.stack));
};

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guestId, limit = 10) {
  return pool.query(`
  SELECT 
  properties.*,
  reservations.*,
  COALESCE(avg(property_reviews.rating), 0) AS average_rating
FROM reservations
LEFT JOIN properties ON properties.id = reservations.property_id
LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = $1 AND end_date < now()::date
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT $2;

  `,[guestId, limit]).then(resp => resp.rows);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) AS average_rating
    FROM properties
    LEFT OUTER JOIN property_reviews ON property_id = properties.id`;

  if (Object.keys(options).length > 1) {
    let queriesAdded = false;

    if (options.city) {
      if (!queriesAdded) {
        queryString += `
        WHERE `;
        queriesAdded = true;
      }
      queryParams.push(`%${options.city}%`);
      queryString += ` properties.city LIKE $${queryParams.length} AND `;
    }
    if (options.owner_id) {
      if (!queriesAdded) {
        queryString += `
        WHERE `;
        queriesAdded = true;
      }
      queryParams.push(Number(options.owner_id));
      queryString += ` properties.owner_id = $${queryParams.length} AND `;
    }
    if (options.minimum_price_per_night) {
      if (!queriesAdded) {
        queryString += `
        WHERE `;
        queriesAdded = true;
      }
      queryParams.push(Number(options.minimum_price_per_night) * 100);
      queryString += ` properties.cost_per_night >= $${queryParams.length} AND `;
    }
    if (options.maximum_price_per_night) {
      if (!queriesAdded) {
        queryString += `
        WHERE `;
        queriesAdded = true;
      }
      queryParams.push(Number(options.maximum_price_per_night) * 100);
      queryString += ` properties.cost_per_night <= $${queryParams.length} AND `;
    }


    if (queriesAdded) {
      queryString = queryString.slice(0, -4);
    }

  }

  queryString += `
    GROUP BY properties.id`;
  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += `
    HAVING avg(rating) >= $${queryParams.length}`;
  }
  queryParams.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};`;

  return pool.query(queryString, queryParams).then(res => res.rows);
};

exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const query = `
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code)
    VALUES ($1, $2, $3, $4, $5, $6 * 100, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;
  const values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms, property.country, property.street, property.city, property.province, property.post_code];

  return pool
    .query(query, values)
    .then(res => res.rows[0])
    .catch(err => console.error('Error executing query', err.stack));
};

exports.addProperty = addProperty;

