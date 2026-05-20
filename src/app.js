import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true


}))

app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())



// routes import
import userRoutes from './routes/user.Routes.js'
import videoRouter from "./routes/video.Routes.js"
import tweetRouter from "./routes/tweet.Routes.js"
import playlistRouter from "./routes/playlist.Routes.js"
import commentRouter from "./routes/comment.Routes.js"
import likeRouter from "./routes/like.Routes.js"
import subscriptionRouter from "./routes/subscription.Routes.js"
import healthcheckRouter from "./routes/healthcheck.Routes.js"
import dashboardRouter from "./routes/dashboard.Routes.js"




// routes declaration
app.use('/api/v1/users', userRoutes)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/dashboard", dashboardRouter)



export { app }