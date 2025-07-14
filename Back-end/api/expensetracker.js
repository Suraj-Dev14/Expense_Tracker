// api/expensetracker.js
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

import graphSchema from '../graphql/typedefs/index.js';
import graphResolver from '../graphql/resolvers/index.js';
import authMiddleware from '../middleware/authMiddleware.js';

const app = express();
const MONGO_URI = "mongodb+srv://suraj1411003:IWEv2NdjQovbSxgB@expense-tracker.viiwnkm.mongodb.net/suraj_test?retryWrites=true&w=majority&"

// Connect to MongoDB only once
let isConnected = false;
const connectToDB = async () => {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
  console.log("Connected to MongoDB");
};

app.get("/", (req, res) => res.send("Expense Tracker API"));

// CORS
app.use(cors({
  origin: '*', // Restrict in production
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(authMiddleware);

// GraphQL middleware
app.use(
  "/",
  graphqlHTTP({
    schema: graphSchema,
    rootValue: graphResolver,
  })
);

// Export as handler for Vercel
export default async function handler(req, res) {
  await connectToDB(); // Ensure DB connection before handling requests
  return app(req, res); // Pass the request to Express
}
