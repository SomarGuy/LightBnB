const properties = require('./json/properties.json');
const users = require('./json/users.json');
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
const getAllReservations = function(guest_id, limit = 10) {
  const query = `
    SELECT *
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    WHERE guest_id = $1
    LIMIT $2;
  `;
  const values = [guest_id, limit];

  return pool
    .query(query, values)
    .then(res => res.rows)
    .catch(err => console.error('Error executing query', err.stack));
};

exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = async function(options, limit = 10) {
  const queryParams = [];
  let queryString = `
    SELECT properties.*, AVG(property_reviews.rating) AS average_rating
    FROM properties
    LEFT OUTER JOIN property_reviews ON property_id = properties.id`;

  const { city, owner_id, minimum_price_per_night, maximum_price_per_night, minimum_rating } = options;

  const conditions = [];

  if (city) {
    queryParams.push(`%${city}%`);
    conditions.push(`properties.city LIKE $${queryParams.length}`);
  }

  if (owner_id) {
    queryParams.push(Number(owner_id));
    conditions.push(`properties.owner_id = $${queryParams.length}`);
  }

  if (minimum_price_per_night) {
    queryParams.push(Number(minimum_price_per_night) * 100);
    conditions.push(`properties.cost_per_night >= $${queryParams.length}`);
  }

  if (maximum_price_per_night) {
    queryParams.push(Number(maximum_price_per_night) * 100);
    conditions.push(`properties.cost_per_night <= $${queryParams.length}`);
  }

  if (conditions.length > 0) {
    queryString += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryString += `
    GROUP BY properties.id`;

  if (minimum_rating) {
    queryParams.push(Number(minimum_rating));
    queryString += `
      HAVING AVG(rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);

  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};`;

  try {
    const res = await pool.query(queryString, queryParams);
    return res.rows;
  } catch (err) {
    console.error(err.message);
  }
};

exports.getAllProperties = getAllProperties;



/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryString = `
    INSERT INTO properties (
      owner_id, 
      title, 
      description, 
      thumbnail_photo_url, 
      cover_photo_url, 
      cost_per_night, 
      parking_spaces, 
      number_of_bathrooms, 
      number_of_bedrooms, 
      country, 
      street, 
      city, 
      province, 
      post_code
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    ) RETURNING *;
  `;
  const queryParams = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
    property.country,
    property.street,
    property.city,
    property.province,
    property.post_code
  ];
  return pool.query(queryString, queryParams)
    .then((result) => result.rows[0])
    .catch((err) => console.log(err.message));
};

exports.addProperty = addProperty;
