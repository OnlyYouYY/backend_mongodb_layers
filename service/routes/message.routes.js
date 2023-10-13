const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/messageController.js");

router.get("/", MessageController.getAllMessage);

router.post("/createMessage", MessageController.createMessage);

module.exports = router;
