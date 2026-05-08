
import { Router } from 'express';
import { registerUser } from '../controllers/userControllers.js';
import { upload } from '../middlewares/multer.middlewares.js'
import { loginUser, logOutUser, refreshAccessToken } from '../controllers/userControllers.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js';
// import { changeCurrentPassword } from '../controllers/userControllers.js'
import { getCurrentUser } from '../controllers/userControllers.js';
import { changeCurrentPassword } from '../controllers/userControllers.js';
import { updateAccountDetails,  updateUserAvatar , updateUserCoverImage , getUserChannelProfile , getWatchHistory} from '../controllers/userControllers.js';



console.log(changeCurrentPassword)

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

router.route('/login').post(
    // upload.none(),
    loginUser)


// secured route
router.route('/logout').post(upload.none(),
    verifyJWT,
    logOutUser)



router.route('/refresh-token').post(
    upload.none(),
    refreshAccessToken)


router.route('/change-password').post(
    upload.none(),
    verifyJWT,
    changeCurrentPassword
)



router.route('/current-user').get(
    upload.none(),
    verifyJWT,
    getCurrentUser
)


router.route('/update-account').patch(
    verifyJWT,
    updateAccountDetails
)

router.route('/avatar').patch(
    verifyJWT,
    upload.single('avatar'),
    updateUserAvatar
)





router.route('/cover-image').patch(
    verifyJWT,
    upload.single('coverImage'),
    updateUserCoverImage


)



router.route('/c/:username').get(
    verifyJWT,
    getUserChannelProfile
)




router.route('/history').get(
    verifyJWT,
    getWatchHistory
)












export default router;







