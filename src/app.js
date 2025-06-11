const express = require("express");
const app = express();
const cors = require("cors"); // Add CORS package

const usersRoutes = require("./routes/usersRoutes");
const campaignsRoutes = require("./routes/campaignsRoutes");
const votesRoutes = require("./routes/votesRoutes");

const sequelize = require("./config/database");
const users = require("./models/user");
const campaigns = require("./models/campaign");
require("./models/association"); // Ensure associations are set up

// Configure CORS
app.use(
  cors({
    origin: "*", // Allow requests from any origin (you might want to restrict this in production)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/users", usersRoutes);
app.use("/campaigns", campaignsRoutes);
app.use("/votes", votesRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Campaign API");
});

const PORT = process.env.PORT || 6000;
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error synchronizing the database:", error);
  });

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});
