# Natours API & Web Application

A comprehensive tour booking application built with Node.js, Express, MongoDB, and server-side rendering with Pug.

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

## About The Project

Natours is a full-stack web application for a fictional tour company. It provides a RESTful API for managing tours, users, and reviews, along with a server-rendered front-end for user interaction. This project demonstrates a modern backend architecture using Node.js and Express, with a focus on security, efficiency, and maintainability.

## Key Features

- **Complete RESTful API:** Full CRUD (Create, Read, Update, Delete) functionality for tours, users, and reviews.
- **Secure User Authentication:** JWT-based authentication with secure password hashing (`bcryptjs`) and cookie-based sessions.
- **Authorization & Access Control:** Role-based permissions (e.g., user, guide, admin) to protect routes and actions.
- **Server-Side Rendering (SSR):** Key pages are rendered on the server using the Pug templating engine for fast initial load times.
- **Advanced Mongoose Features:** Utilizes advanced data modeling, validation, middleware, and query manipulation for robust database interaction.
- **Error Handling:** Centralized error handling for both operational and programming errors in a production-ready format.
- **Security Best Practices:** Implements measures against common threats like NoSQL query injection, XSS, and parameter pollution.

## Tech Stack

Here are the major technologies used in this project:

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Templating Engine:** Pug
- **Authentication:** JSON Web Tokens (JWT), `bcryptjs`
- **Utilities:** `dotenv`, `slugify`, `validator`

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

- npm
  npm install npm@latest -g

- You will also need a running instance of MongoDB. You can use a local installation or a cloud service like MongoDB Atlas.

### Installation

1.  **Clone the repository:**

    git clone [https://github.com/BESINGI-MARINUS/natours.git]

2.  **Navigate to the project directory:**

    cd natours

3.  **Install NPM packages:**

    npm install

4.  **Set up your environment variables:**
    Create a file named `config.env` in the root of your project and add the following variables. Replace the placeholder values with your own.

    ```env
    NODE_ENV=development
    PORT=8000

    # MongoDB Connection String
    DATABASE_URL=your_mongodb_connection_string
    DATABASE_PASSWORD = your database password

    # JWT Configuration
    JWT_SECRET=a-very-strong-and-long-secret-for-jwt
    JWT_EXPIRES_IN=90d
    JWT_COOKIE_EXPIRES_IN=90
    ```

5.  **Run the server:**

    - For development (with automatic restart on file changes):
      npm start
    - For production:
      npm run start:prod

    The application should now be running on `http://localhost:8000`.

## API Endpoints

The RESTful API is the core of the application. Here are some of the main endpoints available:

| Method | Endpoint                        | Description                              | Access          |
| :----- | :------------------------------ | :--------------------------------------- | :-------------- |
| `GET`  | `/api/v1/tours`                 | Get a list of all tours                  | Public          |
| `GET`  | `/api/v1/tours/:id`             | Get details of a single tour             | Public          |
| `POST` | `/api/v1/tours`                 | Create a new tour                        | Private (Admin) |
| `POST` | `/api/v1/users/signup`          | Register a new user                      | Public          |
| `POST` | `/api/v1/users/login`           | Log in a user                            | Public          |
| `GET`  | `/api/v1/users/me`              | Get the current logged-in user's profile | Private         |
| `POST` | `/api/v1/tours/:tourId/reviews` | Create a new review for a specific tour  | Private (User)  |

_You can test these endpoints using a tool like Postman or Insomnia._

## Roadmap

This project is functional but still under development. Here are the planned features to be implemented next:

- [ ] **Mapbox Integration:** Display tour start locations on an interactive map on the tour details page.
- [ ] **Image Uploads:** Allow tour guides and admins to upload cover images and tour photos using Multer.
- [ ] **Payment Gateway:** Integrate Stripe for secure credit card payments to book tours.
- [ ] **User Bookings Page:** Create a dedicated page for users to view their booked tours.
- [ ] **Complete Front-End:** Build out all remaining server-rendered pages for a complete user experience.

## License

Distributed under the MIT License. See `LICENSE` file for more information.

## Contact

BESINGI MARINUS - [@MarinusNyando](https://twitter.com/@MarinusNyando) - marinusnyando@gmail.com

Project Link: [https://github.com/BESINGI-MARINUS/natours.git]
