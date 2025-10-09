import userResolver from "./user.js";
import transactionResolver from "./transaction.js";
import budgetResolver from "./budget.js";

const graphResolver = {
  ...userResolver,
  ...transactionResolver,
  ...budgetResolver,
};

export default graphResolver;