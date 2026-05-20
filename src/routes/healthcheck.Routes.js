import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.Controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route('/').get(healthcheck);

export default router