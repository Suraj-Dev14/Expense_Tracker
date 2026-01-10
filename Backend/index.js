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

// CORS Middleware
app.use(cors({
  origin: '*',
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
  })
);

// MongoDB Connection and Server Start
mongoose.connect(MONGO_URI)
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

