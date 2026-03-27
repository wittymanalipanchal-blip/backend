const express = require("express");
const http = require("http");
const { Server } = require("socket.io"); 
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
const Chat = require("./models/Chat");
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
const meetingRoutes = require("./routes/meetingRoute");
const chatRoutes = require("./routes/chatRoutes");
const bcrypt = require("bcryptjs");
app.use(cors());
app.use(express.json({ limit: "10000mb" }));
app.use(express.urlencoded({ limit: "10000mb", extended: true }));
const path = require("path");
const SECRET_KEY = "mySecretKey123";
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/project-upload", require("./routes/projectUploadRoutes"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("createGroup", async (data) => {
    const newGroup = await Chat.create(data);

    io.emit("newGroup", newGroup);
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected:");
  });

});


mongoose.connect(
  "mongodb+srv://dbuser:dbuser123@user.pe23kpw.mongodb.net/task_manager?retryWrites=true&w=majority"
)
  .then(async () => {
    console.log("MongoDB Connected");
    
    await seedRoles();
    console.log("Roles seeded");

  })
  .catch(err => console.log("MongoDB connection error:", err));

const admin = {
  id: 1,
  email: "manali@gmail.com",
  password: "2406",
  role: "admin"
};
const Role = require("./models/Role");

app.get("/api/users/seed-admin", async (req, res) => {
  try {
    const adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) return res.status(400).json({ message: "Admin role not found" });

    const existingAdmin = await User.findOne({ email: "manali@gmail.com" });
    if (existingAdmin) {
      return res.json({ message: "Admin already exists", user: existingAdmin });
    }

    const hashedPassword = await bcrypt.hash("2406", 10);
    const adminUser = new User({
      full_name: "Manali",
      email: "manali@gmail.com",
      password: hashedPassword,
      role_id: adminRole._id,
      status: "ACTIVE",
    });

    await adminUser.save();
    res.json({ message: "Admin user created", user: adminUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create admin" });
  }
});

// app.post("/api/login", async (req, res) => {
//   console.log("Login request body:", req.body); // Step 1

//   const { email, password } = req.body;

//   if (!email || !password) {
//     console.log("Email or password missing");
//     return res.status(400).json({ message: "Email and password required" });
//   }

//   try {
//     const user = await User.findOne({ email })
//       .select("+password")
//       .populate("role_id");

//     const isMatch = await bcrypt.compare(password, user.password);

//     const token = jwt.sign(
//       {
//         id: user._id,
//         email: user.email,
//         role: user.role_id ? user.role_id.name : "Employee"
//       },
//       SECRET_KEY,
//       { expiresIn: "1h" }
//     );

//     console.log("Token generated successfully");

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.full_name,
//         email: user.email,
//         role: user.role_id ? user.role_id.name : "Employee",
//         role_id: user.role_id ? user.role_id._id : null,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error); // Step 4
//     res.status(500).json({ message: "Login failed" });
//   }
// });

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
app.use("/api/meetings", meetingRoutes);
app.use("/api/chat", chatRoutes);
app.get("/api/chat/groups", async (req, res) => {
  try{
    const groups = await Chat.find();
    res.json(groups);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log("Server running on port " + PORT);
// });

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
