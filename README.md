# Feegow Clinic - COVID-19 Vaccination Management System

## Overview

The Feegow Clinic COVID-19 Vaccination Management System is a web application designed to manage and control the vaccination status of employees against COVID-19. The system allows for the registration of employees, tracking of vaccination doses, and management of vaccine information.

## Features

- **Employee Management**: Register and manage employees with details such as CPF, full name, birth date, and comorbidity status.
- **Vaccination Tracking**: Record and manage vaccination doses for each employee, including vaccine type, batch, and expiration date.
- **Vaccine Management**: Add and manage vaccine information.
- **Non-Vaccinated Report**: Generate a report of employees who have not received any vaccination doses.

## Technologies Used

- **Backend**: Node.js with Express.js
- **Frontend**: Svelte
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker

## Getting Started

Follow the instructions below to set up and run the project locally.

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **Docker**: Ensure you have Docker installed. You can download it from [docker.com](https://www.docker.com/).

### Installation

1. **Clone the repository**:
    ```sh
    git clone git@github.com:augustresende/feegow-challenge-covid.git
    cd feegow-challenge-covid
    ```

2. **Startup the database**:
    ```sh
    docker-compose up
    ```

3. **Set up the backend**:
    ```sh
    npm install
    npm start
    ```

4. **Set up the frontend**:
    ```sh
    cd front
    npm install
    npm run dev -- --open
    ```

### Running the Application

- **Backend**: The backend server will be running on `http://localhost:3000`.
- **Frontend**: The frontend application will open in your default browser.

## API Endpoints

### Employees

- `GET /employees`: Retrieve all employees.
- `GET /employees/:id`: Retrieve a specific employee by ID.
- `POST /employees`: Create a new employee.
- `PATCH /employees/:id`: Update an existing employee.
- `DELETE /employees/:id`: Delete an employee.
- `POST /employees/:id/dose`: Add a vaccination dose to an employee.
- `DELETE /employees/:id/dose/:doseId`: Delete a vaccination dose from an employee.
- `GET /employees/report/non-vaccinated`: Generate a report of non-vaccinated employees.

### Vaccines

- `GET /vaccines`: Retrieve all vaccines.
- `GET /vaccines/:id`: Retrieve a specific vaccine by ID.
- `POST /vaccines`: Create a new vaccine.
- `PATCH /vaccines/:id`: Update an existing vaccine.
- `DELETE /vaccines/:id`: Delete a vaccine.