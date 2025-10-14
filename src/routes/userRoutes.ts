import { Router } from "express";
import { deleteUser, editUser, signup } from "../controllers/userController";
import { validateUser } from "../middleware/validateUser";

const router: Router = Router();

router.post("/signup", validateUser, signup);
router.put("/:id", validateUser, editUser);
router.delete("/:id", deleteUser);

export default router;
