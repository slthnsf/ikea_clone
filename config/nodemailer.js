// password 2FA Gmail : ylwbwypxhhttense

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ssafinatunnajah@gmail.com',
        pass: 'ylwbwypxhhttense',
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = {transporter}