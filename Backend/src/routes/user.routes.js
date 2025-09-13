import { Router } from "express";
import { addToHistory, getUserHistory, login, register, validateMeetingCode, validateToken, logout, deleteMeeting } from "../controllers/user.controller.js";

const router=Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/validate-meeting").post(validateMeetingCode);
router.route("/validate-token").post(validateToken);
router.route("/logout").post(logout);
router.route("/delete-meeting").post(deleteMeeting);

export default router;