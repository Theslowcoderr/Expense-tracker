const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    totalBudget: Number,
    remainingBudget: Number,
    duration: Number
});

module.exports = mongoose.model("Budget", budgetSchema);