/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       200:
 *         description: User registered and OTP sent
 *       400:
 *         description: User already exists
 */

/**
 * @swagger
 * /verify-email:
 *   post:
 *     summary: Verify email using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmail'
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /resend-otp:
 *   post:
 *     summary: Resend OTP for email verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOTP'
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Email not found or OTP still valid
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Incorrect email or password
 */

/**
 * @swagger
 * /check/credentials:
 *   post:
 *     summary: Check user credentials
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Credentials are valid
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get logged-in user's info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data fetched
 *       400:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /profile-upload:
 *   post:
 *     summary: Upload profile image
 *     tags: [Auth]
 *     consumes:
 *       - multipart/form-data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded
 *       400:
 *         description: Upload error
 */
