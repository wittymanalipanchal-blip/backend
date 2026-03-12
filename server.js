const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const clientRoutes = require("./routes/clientRoutes");
const Client = require("./models/Client");
const userRoutes = require("./routes/userRoutes");
const app = express();
app.use(express.json());
const seedRoles = require("./seed/roleSeeder");
const authRoutes = require("./routes/auth");
const roleRoutes = require("./routes/roleRoutes");
const User = require("./models/User");
const announcementRoutes = require("./routes/announcementRoutes");
const projectReportRoutes = require("./routes/projectReportRoutes");
const timeTrackingRoutes = require("./routes/timeTrackingRoutes");
const teamRoutes = require("./routes/teamRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/ProfileRoute");
const eventRoutes = require("./routes/eventRoute");
const reportRoutes = require("./routes/reportRoutes");
const bcrypt = require("bcryptjs");
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const path = require("path");
const SECRET_KEY = "mySecretKey123";
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/project-upload", require("./routes/projectUploadRoutes"));

mongoose
  .connect("mongodb://127.0.0.1:27017/task_manager")
  .then(async () => {
    console.log("MongoDB Connected");
    await seedRoles();
  })
  .catch(err => console.log(err));

const admin = {
  id: 1,
  email: "manali@gmail.com",
  password: "2406",
  role : "admin"
};

app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;

 

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email })
      .select("+password")
      .populate("role_id");

    if (!user) {
      return res.status(401).json({ message: "User not available" });
    }

    if (!user.password) {
      return res.status(500).json({ message: "Password missing in DB" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: role
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.full_name,
        email: user.email,
        role: user.role_id.name,
        role_id: user.role_id._id
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/api/client/create", async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/client", async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/client/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/client/:id", async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(updatedClient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/client/:id", async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/project-report", projectReportRoutes);
app.use("/api/time-tracking", timeTrackingRoutes);
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/teams", teamRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reports", reportRoutes);


app.listen(5000, "0.0.0.0", () => {
  console.log("Server running");
});

