const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const userController = require("../controllers/userController");

router.post("/api-endpoint", apiController.endpoint);
router.get("/api-endpoint", apiController.endpoint);
router.get("/reports", apiController.getAllReports);
router.get("/reports/:id", apiController.getReportById);

router.post("/user-endpoint", userController.userEndpoint);
router.get("/user-endpoint", userController.userEndpoint);
router.get("/user-submissions", userController.getAllUserSubmissions);
router.get("/user-submissions/:id", userController.getUserSubmissionById);

module.exports = router;
