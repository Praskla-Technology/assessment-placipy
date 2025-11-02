# PlaciPy Backend

This is the backend for the PlaciPy application, which handles authentication, authorization, and data management.

## Prerequisites

- Node.js (v14 or higher)
- AWS Account with:
  - Cognito User Pool
  - DynamoDB Table
  - Proper IAM permissions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy the `.env.example` file to `.env` and fill in your AWS configuration:
   ```env
   # AWS Configuration
   AWS_REGION=us-east-1
   COGNITO_REGION=us-east-1
   COGNITO_USER_POOL_ID=your-actual-cognito-user-pool-id
   COGNITO_CLIENT_ID=your-actual-cognito-client-id
   COGNITO_JWKS_URL=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_yourUserPoolId/.well-known/jwks.json

   # DynamoDB Configuration
   DYNAMODB_TABLE_NAME=Assesment_placipy

   # Server Configuration
   PORT=3001
   ```

3. Set up AWS resources:
   Follow the detailed guide in [scripts/setup-aws-resources.md](scripts/setup-aws-resources.md)

4. Populate test data (optional):
   ```bash
   node scripts/populate-test-data.js
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile (requires authentication)
- `PUT /api/users/profile` - Update user profile (requires authentication)
- `POST /api/users/forgot-password` - Initiate password reset
- `POST /api/users/reset-password` - Confirm password reset

## Security

- All API endpoints (except login/register) require authentication
- JWT tokens are validated using AWS Cognito JWKS
- User roles are verified against DynamoDB data
- Rate limiting is implemented to prevent abuse

## Architecture

The backend follows a layered architecture:
- Controllers handle HTTP requests
- Services contain business logic
- Middleware handles authentication and authorization
- Models define data structures

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
