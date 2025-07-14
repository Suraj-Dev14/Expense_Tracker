import express from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import graphSchema from './graphql/typedefs/index.js';
import graphResolver from './graphql/resolvers/index.js';
import authMiddleware from './middleware/authMiddleware.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// Basic check for required env
if (!MONGO_URI) {
  console.error("MONGO_URI not found in .env");
  process.exit(1);
}

// CORS Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://yourfrontend.com'] : '*',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(bodyParser.json());

// Authentication Middleware
app.use(authMiddleware);

// GraphQL Endpoint
app.use(
  "/expensetracker",
  graphqlHTTP({
    schema: graphSchema,
    rootValue: graphResolver,
    graphiql: process.env.NODE_ENV !== "production", // Enable GraphiQL in dev only
  })
);

// MongoDB Connection and Server Start
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server running...`);
  });
})
.catch((err) => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
});

