
# Resale Zone Backend

## Overview

Resale Zone is a comprehensive backend solution for an online platform dedicated to the buying and selling of second-hand products. This server-side application handles user authentication, product listings, bookings, payments, and admin functionalities with a focus on user experience and security.

## Technology Stack

-   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine, used for building fast and scalable network applications.
-   **Express.js:** A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
-   **MongoDB:** A source-available cross-platform document-oriented database program.
-   **JWT (JSON Web Tokens):** A compact, URL-safe means of representing claims to be transferred between two parties.
-   **Stripe:** A suite of payment APIs that powers commerce for online businesses.
-   **Cors:** A node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
-   **Dotenv:** A zero-dependency module that loads environment variables from a `.env` file into `process.env`.

## Key Features

-   **User Authentication:** Securely manage user access with JWT.
-   **Product Listings:** Add, view, update, and delete product listings.
-   **Booking System:** Handle bookings for various products.
-   **Payment Integration:** Implement payments through Stripe for secure transactions.
-   **Admin Functionalities:** Manage users and listings with admin-specific controls.
-   **Dynamic Product Categories:** Categorize products dynamically (e.g., One Plus, iPhone, Xiaomi).
-   **Advertisement Management:** Handle and display product advertisements.

## API Endpoints

### User Authentication

-   `POST /jwt`: Generate JWT for user authentication.
-   `GET /users/seller/:email`: Check if a user is a seller.
-   `GET /users/admin/:email`: Check if a user is an admin.

### Product Management

-   `GET /addproduct`: Retrieve added products.
-   `POST /addproduct`: Add new products.
-   `PUT /addproduct/report/:id`: Report a product.
-   `PUT /addproduct/advertise/:id`: Update product to advertise.
-   `DELETE /products/:id`: Delete a product.

### Booking and Payments

-   `GET /bookings`: Retrieve bookings.
-   `POST /booking`: Create a new booking.
-   `POST /payments`: Handle payment information.
-   `POST /create-payment-intent`: Create a payment intent with Stripe.

### Admin Functions

-   `GET /allsellers`: Retrieve all sellers.
-   `PUT /allseller/admin/:id`: Promote seller to admin.
-   `DELETE /allsellers/:id`: Delete a seller.

### General

-   `GET /`: Default route for server status.

## Installation

To get the server running locally:

1.  **Clone the repo:**
    
    
    `git clone https://github.com/your-username/resale-zone-server.git` 
    
2.  **Install dependencies:**
    
    
    `npm install` 
    
3.  **Set up the environment variables:**
    
    -   Rename `.env.example` to `.env`.
    -   Fill in the environment variables in `.env`.
4.  **Start the server:**
    
    
    `npm start` 
    

## Environment Variables

In your `.env` file, set the following keys:


`DB_USER=<Your MongoDB User>
DB_PASS=<Your MongoDB Password>
STRIPE_SECRET=<Your Stripe Secret Key>
SECRET_TOKEN=<Your JWT Secret Key>` 

## Author Information

-   **Imam Hossain**
    -   Role: Backend Developer
    -   Email : imamhossain6t9@gmail.com
    - Phone: +8801624243747
    -   LinkedIn: https://www.linkedin.com/in/imam-hossain-web-dev/

----------

This project is under development and open to contributions. If you find a bug or have a feature request, please create an issue on the repository.
