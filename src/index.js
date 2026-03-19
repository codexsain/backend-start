// require('dotenv').config()
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import app from './app.js';


dotenv.config({
    path: './env'
})


connectDB()

    .then(() => {

        app.on('error', (error) => {

            console.log('ERROR on app befor listen :', error);
            throw error

        })



        try {
            app.listen(process.env.PORT || 3000)
            console.log(`server is runing at ${process.env.PORT}`)

        } catch (error) {

            console.log("server connecting error ")
        }

    })


    .catch((error) => {
        console.log("mongodb connection fail  ERROR: ", error)
    })





















/*
import express from'express'

const app = express()

(async () => {

    try {

        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error', (error) => {
          console.log('ERROR :' ,  error);
          throw error

        })
   

        app.listen(process.env.PORT , () => {
            console.log(`app listen on ${process.env.PORT}`)
        })


    } catch (error) {

        console.log("error heppening" + error)

    }


})()
*/