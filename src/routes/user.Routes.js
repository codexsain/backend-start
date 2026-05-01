import {Router} from 'express';
import  {registerUser}  from '../controllers/userControllers.js';
import {upload} from '../middlewares/multer.middlewares.js'
import {loginUser , logOutUser} from '../controllers/userControllers.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js';






const router = Router();

router.route('/register').post(
    
    upload.fields([

        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }

    ]),
    
    registerUser

);

router.route('/login').post(loginUser)


// secured route
router.route('/logout').post( verifyJWT,   logOutUser)

export default router;