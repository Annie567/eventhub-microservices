const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 用内存数组保存日志
let notifications = [];

// 健康检查
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "notification-service"
  });
});

// 注册/报名通知
app.post("/notify/registration", (req, res) => {
  const { participant, event } = req.body;

  const item = {
    type: "registration",
    participant,
    event,
    time: new Date().toISOString()
  };

  notifications.push(item);

  console.log("Registration Notification:");
  console.log(`User: ${participant}, Event: ${event}`);

  res.json({
    message: "Registration notification processed",
    data: item
  });
});

// 退出活动通知
app.post("/notify/leave", (req, res) => {
  const { participant, event } = req.body;

  const item = {
    type: "leave",
    participant,
    event,
    time: new Date().toISOString()
  };

  notifications.push(item);

  console.log("🚪 Leave Notification:");
  console.log(`User: ${participant}, Event: ${event}`);

  res.json({
    message: "Leave notification processed",
    data: item
  });
});

// 新建用户通知
app.post("/notify/user-created", (req, res) => {
  const { username, email } = req.body;

  const item = {
    type: "user-created",
    username,
    email,
    time: new Date().toISOString()
  };

  notifications.push(item);

  console.log("👤 User Created:");
  console.log(`Username: ${username}, Email: ${email}`);

  res.json({
    message: "User created notification processed",
    data: item
  });
});

// 删除用户通知
app.post("/notify/user-deleted", (req, res) => {
  const { username, email } = req.body;

  const item = {
    type: "user-deleted",
    username,
    email,
    time: new Date().toISOString()
  };

  notifications.push(item);

  console.log("🗑️ User Deleted:");
  console.log(`Username: ${username}, Email: ${email}`);

  res.json({
    message: "User deleted notification processed",
    data: item
  });
});

// 创建事件通知
app.post("/notify/event-created", (req, res) => {
  const { title, start_time } = req.body;

  const item = {
    type: "event-created",
    title,
    start_time,
    time: new Date().toISOString()
  };

  notifications.push(item);

  console.log("📅 Event Created:");
  console.log(`Title: ${title}, Start time: ${start_time}`);

  res.json({
    message: "Event created notification processed",
    data: item
  });
});

// 删除事件通知
app.post("/notify/event-deleted", (req, res) => {
  const { title, start_time } = req.body;

  const item = {
    type: "event-deleted",
    title,
    start_time,
    time: new Date().toISOString()
  };

  notifications.push(item);

  console.log("🗑️ Event Deleted:");
  console.log(`Title: ${title}, Start time: ${start_time}`);

  res.json({
    message: "Event deleted notification processed",
    data: item
  });
});

// 查看所有通知
app.get("/notifications", (req, res) => {
  res.json(notifications);
});

// 清空通知
app.delete("/notifications", (req, res) => {
  notifications = [];
  res.json({ message: "All notifications cleared" });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 Notification service running on port ${PORT}`);
});