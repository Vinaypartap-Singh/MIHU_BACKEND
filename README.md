# MIHU Backend API

This repository contains the backend API for MIHU. The API is built to handle authentication, password management, and error handling efficiently.

## API Routes

### Authentication Routes

- **POST `/api/auth/register`**  
  Register a new user.

- **POST `/api/auth/verify-email`**  
  Verify the email address of the registered user.

- **POST `/api/auth/resend-otp`**  
  Resend the OTP to the user's email for verification.

- **POST `/api/auth/login`**  
  Log in an existing user.

- **GET `/api/auth/user`**  
  Retrieve user information.

### Password Management Routes

- **POST `/api/password/request-reset-password`**  
  Request a password reset by sending an OTP to the user's email.

- **POST `/api/password/reset-password`**  
  Verify the OTP and reset the user's password if verified.

## Error Handling

Error handling is managed by two helper functions:
- **handleCatchError**: This function captures errors, particularly from Zod validation, and returns a structured error response.
- **handleTryResponseError**: This function provides a consistent response structure for successful operations and common errors.

## Utility Functions

### sendMail

The `sendMail` function is used to send emails. It takes the following parameters:
- `to`: The recipient's email address.
- `message`: The content of the email.
- `html`: The path to the HTML file for the email template.

### formatZodError

The `formatZodError` function simplifies Zod error messages by mapping through validation errors, providing a clearer and more concise error response for clients.

### renderEmailEjs

The `renderEmailEjs` function renders EJS templates into HTML format. It takes an EJS file and converts it into an HTML version suitable for sending as an email.

## Installation

To install the necessary dependencies, run:

```bash
npm install
```
## Usage

After cloning the repository and installing the dependencies, start the server using:
```bash
npm install
```
## Contributing

Feel free to open issues or submit pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
### Notes: - Adjust any sections as necessary to match your project specifics. 
- Ensure the installation, usage, and contribution instructions align with how you want users to interact with your project. - Include additional sections like **License**, **Contact Information**, or **Acknowledgments** if relevant.
