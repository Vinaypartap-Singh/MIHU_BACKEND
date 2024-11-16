

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

- **POST `/api/password/reset-request-password-2fa`**  
  If Two-Factor Authentication (2FA) is enabled, this route sends a password reset request to the user's 2FA email (if available). This step ensures an additional layer of security for the user.

- **POST `/api/password/reset-password-2fa`**  
  This route is used to verify the OTP sent to the 2FA email and reset the user's password if the verification succeeds. This ensures that only the authenticated user with access to the 2FA email can change the password.


### Post Routes

- **POST `/api/posts/upload`**  
  Upload a new post. Requires authentication and an image file.

- **PUT `/api/posts/post/:id`**  
  Update a post by its ID. Requires authentication and ensures only the author can edit their post.

- **DELETE `/api/posts/post/:id`**  
  Delete a post by its ID. Requires authentication and ensures only the author can delete their post.

- **GET `/api/posts/post/:id`**  
  Retrieve a specific post by its ID, including author details, comments, and likes.

- **GET `/api/posts`**  
  Retrieve all posts, ordered by the latest first. Includes author details, comments, and likes.


### Like Routes

- **POST `/api/like/:postId`**  
  Like a specific post by its ID.  
  - **Requires Authentication**: The user must be logged in.  
  - **Validations**:  
    - The user must have a verified email.  
    - The post must exist.  
    - The user must not have already liked the post.  
  - **Response**:  
    - Success: "Post Liked Successfully" along with the updated like information.  
    - Errors:  
      - "Please Log In To like the post"  
      - "Please Verify Your Email To like the post"  
      - "Post Not Found"  
      - "You have already liked this post"  

- **DELETE `/api/unlike/:postId`**  
  Unlike a specific post by its ID.  
  - **Requires Authentication**: The user must be logged in.  
  - **Validations**:  
    - The post must exist.  
    - The user must have previously liked the post.  
  - **Response**:  
    - Success: "Post Unliked Successfully".  
    - Errors:  
      - "Post Not Found"  
      - "You haven't liked this post yet"
     
### Comment Routes

- **POST `/api/post/:id/comment`**  
  Add a comment to a post.  
  - **Requires Authentication**: Yes  
  - **Validations**: Verified email, valid post, and non-empty content  
  - **Response**: Success or relevant error messages  

- **PUT `/api/comment/:id`**  
  Update a comment by ID.  
  - **Requires Authentication**: Yes  
  - **Validations**: Verified email, valid comment, ownership, and non-empty content  
  - **Response**: Success or relevant error messages  

- **DELETE `/api/comment/:id`**  
  Delete a comment by ID.  
  - **Requires Authentication**: Yes  
  - **Validations**: Verified email, valid comment, and ownership  
  - **Response**: Success or relevant error messages  

- **GET `/api/post/:id/comments`**  
  Get all comments for a post.  
  - **Validations**: Valid post  
  - **Response**: List of comments or error message  

### Follower Routes

- **POST `/api/follow/:id`**  
  Follow a user.  
  - **Requires Authentication**: Yes  
  - **Validations**: Verified email, not following yourself, and no existing follow relationship  
  - **Response**: Success or relevant error messages  

- **DELETE `/api/unfollow/:id`**  
  Unfollow a user.  
  - **Requires Authentication**: Yes  
  - **Validations**: Verified email, not unfollowing yourself, and existing follow relationship  
  - **Response**: Success or relevant error messages  

- **GET `/api/followers/:id`**  
  Get all followers of a user.  
  - **Validations**: Valid user  
  - **Response**: List of followers or error message  

- **GET `/api/following/:id`**  
  Get all users a specific user is following.  
  - **Validations**: Valid user  
  - **Response**: List of users being followed or error message

  

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
