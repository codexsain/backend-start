import {asyncHandler} from '../utils/asyncHandler.js';

const registerUser = asyncHandler( async (req , res , next ) => {

    // console.log(res)



     res.status(200).json({
         
         message: "User Registered Successfully"
        })

  
        
})


export   {registerUser} 