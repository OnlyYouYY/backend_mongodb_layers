const express = require("express");
const router = express.Router();
const KnowledgeController = require("../controllers/knowledgeController.js");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get("/", KnowledgeController.getAllKnowledge)

router.post("/importDataFromCSV", upload.single('file'),KnowledgeController.importDataFromCSV);

module.exports = router;
