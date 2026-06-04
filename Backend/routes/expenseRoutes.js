const express = require("express");
const router = express.Router();

const Expense = require("../modules/Expense");

router.post("/add", async (req, res) => {

    try {

        const expense = new Expense(req.body);

        await expense.save();

        res.json({
            message: "Expense Added",
            expense
        });

    } catch(error) {

        res.status(500).json({
            message: "Error adding expense"
        });

    }

});

module.exports = router;

router.get("/expenses", async (req, res) => {
    try {
        const expenses = await Expense.find();

        res.json(expenses);

    } catch (error) {

        res.status(500).json({
            message: "Error fetching expenses"
        });
    }
});