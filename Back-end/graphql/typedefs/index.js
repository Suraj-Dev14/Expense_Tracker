import { buildSchema } from "graphql";

const graphSchema = buildSchema(`
      type Transaction {
        _id: ID!
        transactionType: String!
        category: String!
        amount: Float!
        description: String!
        date: String!
      }

      type Budget {
        _id: ID!
        category: String!
        limit: Float!
        spend: Float
      }

      type User {
        _id: ID!
        name: String
        email: String!
        password: String
        contact: String
        address: String
        transactions: [Transaction!]
        budgets: [Budget!]
        profileImage: String
      }

      type authData{
        userId: ID!
        token: String!
        tokenExpiration: Int!
      }

      input userInput {
        email: String!
        password: String!
      }

      input updateUserInput {
        userId: ID!
        name: String!
        address: String!
        contact: String!
        profileImage: String
      }

      input transactionInput{
        transactionType: String!
        category: String!
        amount: Float!
        description: String!
        date: String!
      }

      input budgetInput{
        category: String!
        limit: Float!
      }

      type RootQuery {
        login(email: String!, password: String!): authData
        getUserinfo: User
      }

      type RootMutation {
        registerUser(user: userInput!): User
        updateUser(user: updateUserInput): User
        addTransaction(transaction: transactionInput): Transaction
        deleteTransaction(transactionId: ID!): Transaction!
        updateTransaction(transactionId: ID!, transaction: transactionInput!): Transaction!
        addBudget(budget: budgetInput!): Budget
        deleteBudget(budgetId: ID!): Budget!
        updateBudget(budgetId: ID!, budget: budgetInput!): Budget!
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `);

export default graphSchema;