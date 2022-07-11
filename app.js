// @diltz
// discord-proxy

const express = require("express")
const dotenv = require("dotenv")
const helmet = require("helmet")
const axios = require("axios")

//

const app = express()

//

dotenv.config()

// middlewares

app.use(express.json())
app.use(helmet())
app.use(async function(req, res, next){
    if (req.method == "DELETE" && process.env.ALLOW_DELETE_METHOD == "false") {
        return res.status(405).json({
            success: false,
            message: "DELETE method not allowed!"
        })
    } else if (req.method == "HEAD") {
        return res.status(405).json({
            success: false,
            message: "HEAD method not supported"
        })
    } else if (process.env.USE_AUTH_KEY == "true" && process.env.AUTH_KEY != req.headers.authorization) {
        return res.status(401).json({
            success: true,
            message: "authorization header required"
        })
    }

    return next()
})

//

app.all("*", async function(req, res) {
    //console.log("https://discord.com" + req.url)

    if (req.method == "GET") {
        data = await axios({
            url: "https://discord.com" + req.url,
            method: "get",
            headers: {
                "content-type": "application/json"
            },
        })
    } else {
        data = await axios({
            url: "https://discord.com" + req.url,
            method: req.method,
            headers: {
                "content-type": "application/json"
            },
            body: req.body
        })
    }

    return res.status(data.status).json(data.data)
})

// init app

app.listen(process.env.APP_PORT || 8080, () => {
    console.log("discord-proxy started at port " + process.env.APP_PORT || 8080 + " on localhost")
})