# LightBnB

#
A database application project developed as a part of _[Lighthouse Labs Web development](https://www.lighthouselabs.ca/web-bootcamp)_ course. The front-end is forked from [lighthouse-labs/LightBnB_WebApp](https://github.com/lighthouse-labs/LightBnB_WebApp)
Install the LightBnB_WebApp `npm install`, run it `npm run local`, and view it at `localhost:3000`.

#Homepage
![homepage](docs/homepage.png)

## Project Structure

```
├── public
│   ├── index.html
│   ├── javascript
│   │   ├── components 
│   │   │   ├── header.js
│   │   │   ├── login_form.js
│   │   │   ├── new_property_form.js
│   │   │   ├── property_listing.js
│   │   │   ├── property_listings.js
│   │   │   ├── search_form.js
│   │   │   └── signup_form.js
│   │   ├── index.js
│   │   ├── libraries
│   │   ├── network.js
│   │   └── views_manager.js
│   └── styles
├── sass
└── server
  ├── apiRoutes.js
  ├── database.js
  ├── json
  ├── server.js
  └── userRoutes.js
```

* `public` contains all of the HTML, CSS, and client side JavaScript. 
  * `index.html` is the entry point to the application. It's the only html page because this is a single page application.
  * `javascript` contains all of the client side javascript files.
    * `index.js` starts up the application by rendering the listings.
    * `network.js` manages all ajax requests to the server.
    * `views_manager.js` manages which components appear on screen.
    * `components` contains all of the individual html components. They are all created using jQuery.
* `sass` contains all of the sass files. 
* `server` contains all of the server side and database code.
  * `server.js` is the entry point to the application. This connects the routes to the database.
  * `apiRoutes.js` and `userRoutes.js` are responsible for any HTTP requests to `/users/something` or `/api/something`. 
  * `json` is a directory that contains a bunch of dummy data in `.json` files.
  * `database.js` is responsible for all queries to the database. It doesn't currently connect to any database, all it does is return data from `.json` files.


  ## ERD Info
- _`users`_
  - `id`: Primary Key
  - `name`
  - `email`
  - `password`
  
- _`property_types`_
  - `id`: Primary Key
  - `type`

- _`properties`_
  - `id`: Primary Key
  - `title`
  - `description`
  - `thumbnail_photo_url`
  - `cover_photo_url`  
  - `owner_id` : Foreign Key _`users(id)`_
  - `cost_per_night`
  - `country`
  - `street`
  - `city`
  - `province`
  - `postal_code`
  - `parking_spaces`
  - `number_of_bedrooms`
  - `number_of_washrooms`
  - `property_type` : Optional, defaults to `1`, in future may references _`property_types(id)`_
  - `active`

- _`reservations`_
  - `id`: Primary Key
  - `start_date`
  - `end_date`
  - `property_id` : Foreign Key _`properties(id)`_
  - `guset_id` : Foreign Key _`users_id(id)`_

- _`property_reviews`_
  - `id`: Primary Key
  - `guest_id` : Foreign Key _`users(id)`_
  - `property_id` : Foreign Key _`properties(id)`_
  - `reservation_id` : Foreign Key _`reservations(id)`_
  - `message`
  - `rating`