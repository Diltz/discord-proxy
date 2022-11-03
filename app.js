// @diltz
// discord-proxy

const express = require("express")
const dotenv = require("dotenv")
const helmet = require("helmet")
const request = require("request")

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

    // headers modify

    req.headers["user-agent"] = "discord-proxy"

    delete req.headers.authorization
    delete req.headers.host
    delete req.headers.connection

    //

    var options = {
        method: req.method,
        headers: req.headers
    }

    console.log(req.body)

    if (req.body[0]) {
        options.body = req.body
    }

    console.log(options.body)

    request('https://discord.com' + req.url, options, (error, response, body) => {
        if (error) {
            console.error(error)

            return res.status(500).json({
                success: false,
                message: error
            })
        }

        res.status(response.statusCode).json(JSON.parse(body))
    })
})

// init app

app.listen(process.env.APP_PORT || 8080, () => {
    console.log("discord-proxy started at port " + process.env.APP_PORT || 8080 + " on localhost")
})