require("dotenv").config();
const Expense = require("./modules/Expense");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});

app.post("/add-expense", (req, res) => {

    console.log(req.body);

    res.json({
        message: "Expense received successfully"
    });

});

const expenseRoutes = require("./routes/expenseRoutes");

app.use("/expenses", expenseRoutes);

fetch("http://localhost:5000/expenses/add", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        title: "Burger",
        amount: 100,
        category: "Food"
    })

})
.then(res => res.json())
.then(data => {
    console.log(data);
});

console.log(Expense);

app.get("/expenses", async (req, res) => {

    try {

        const expenses = await Expense.find();

        res.json(expenses);

    } catch (error) {

        res.json({
            message: "Error fetching expenses"
        });

    }

});

