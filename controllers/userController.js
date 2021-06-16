const { db, dbQuery, transporter, createToken } = require('../config')
// const transporter = require('../config/nodemailer')
const Crypto = require('crypto')
// const { createToken } = require('../config/token')

module.exports = {
    getUsers: async (req, res) => {
        try {
            let getSQL, dataSearch = []
            for (let prop in req.query) {
                dataSearch.push(`${prop} = ${db.escape(req.query[prop])}`)
            }
            console.log(dataSearch.join(' AND '))
            if (dataSearch.length > 0) {
                getSQL = `Select * from tb_user where ${dataSearch.join(' AND ')};`
            } else {
                getSQL = `Select * from tb_user;`
            }
            let get = await dbQuery(getSQL)
            res.status(200).send(get)

        } catch (error) {
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    },
    login: (req, res) => {
        if (req.body.email && req.body.password) {
            console.log(req.body.email)
            // HASHING PASS
            let hashPassword = Crypto.createHmac("sha256", "ikea$$$").update(req.body.password).digest("hex")
            let getSQL = `Select * from tb_user
            where email=${db.escape(req.body.email)} and password=${db.escape(hashPassword)};`
            db.query(getSQL, (err, results) => {
                if (err) {
                    res.status(500).send({ status: 'Error Mysql', message: err })
                }
                if (results.length > 0) {
                    let { idtb_user, username, email, role, idtb_status } = results[0]
                    let token = createToken({ idtb_user, username, email, role, idtb_status })
                    res.status(200).send({idtb_user, username, email, role, idtb_status, token})
                } else {
                    res.status(404).send({ status: 'Error Mysql', message: 'Invalid Email and Password' })
                }
            })
        } else {
            res.status(500).send({ error: true, message: 'Your params not complete' })
        }
    },
    register: async (req, res) => {
        try {
            // GENERATE OTP
            let karakter = '0123456789abcdefghijklmnopqrstuvwxyz'
            let OTP = ''

            for (let i = 0; i < 6; i++) {
                OTP += karakter.charAt(Math.floor(Math.random() * karakter.length))
            }

            // HASHING PASS
            let hashPassword = Crypto.createHmac("sha256", "ikea$$$").update(req.body.password).digest("hex")

            // FUNGSI REGISTER
            let insertSQL = `Insert into tb_user (username, email, password, otp) 
            values (${db.escape(req.body.username)}, ${db.escape(req.body.email)}, ${db.escape(hashPassword)}, ${db.escape(OTP)}) ;`
            let regis = await dbQuery(insertSQL)
            let getUser = await dbQuery(`Select * from tb_user where idtb_user = ${regis.insertId}`)
            let { idtb_user, username, email, role, idtb_status, otp } = getUser[0]

            // Membuat Token
            let token = createToken({ idtb_user, username, email, role, idtb_status })

            // Membuat Config email
            // 1. KONTEN EMAIL
            let mail = {
                from: 'Admin IKEA <ssafinatunnajah@gmail.com>', //email pengirim sesuai dengan config nodemailer
                to: email, //email penerima sesuai data Select dari database
                subject: '[IKEA-WEB] Verification Email',
                html: `<div style="text-align: 'center'">
                <p>Your OTP: <b>${otp}</b></p>
                <a href='http://localhost:3000/verification/${token}'>Verification your Email</a></div>`
            }
            // 2. CONFIG TRANSPORTER
            await transporter.sendMail(mail)
            res.status(201).send({ success: true, message: "Register Success" })
        } catch (error) {
            console.log(error)
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    },
    keepLogin: (req, res) => {
        // console.log(req.body)
        if (req.user.idtb_user) {
            let getSQL = `Select * from tb_user where
            idtb_user=${db.escape(req.user.idtb_user)};`

            db.query(getSQL, (err, results) => {
                if (err) {
                    res.status(500).send({ status: 'Error Mysql Login', messages: err })
                }
                if (results) {
                    let { idtb_user, username, email, role, idtb_status } = results[0]
                    let token = createToken({ idtb_user, username, email, role, idtb_status })
                    res.status(200).send({ idtb_user, username, email, role, idtb_status, token })
                } else {
                    res.status(404).send({ status: 'Account Not Found' })
                }
            })
        } else {
            res.status(500).send({ error: true, messages: "Your params not complete" })
        }
    },
    verify: async (req, res) => {
        try {
            console.log("hasil readToken", req.user)
            let update = `Update tb_user set idtb_status = 11 where otp = ${db.escape(req.body.otp)};`
            update = await dbQuery(update)
            let get = `Select u.*, s.status from tb_user u join tb_status s on u.idtb_status = s.idtb_status where otp = ${db.escape(req.body.otp)};`
            get = await dbQuery(get)
            res.status(200).send(get)
        } catch (error) {
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    },
    reverif: async (req, res) => {
        try {
            let hashPassword = Crypto.createHmac("sha256", "ikea$$$").update(req.body.password).digest("hex")

            // GENERATE OTP
            let karakter = '0123456789abcdefghijklmnopqrstuvwxyz'
            let OTP = ''

            for (let i = 0; i < 6; i++) {
                OTP += karakter.charAt(Math.floor(Math.random() * karakter.length))
            }

            let getUser = await dbQuery(`Select * from tb_user where email = ${db.escape(req.body.email)} and password = ${db.escape(hashPassword)}`)
            if (getUser[0].idtb_status == 12) {
                let update = `Update tb_user set otp = ${db.escape(OTP)} where email = ${db.escape(req.body.email)};`
                update = await dbQuery(update)
                let get2 = await dbQuery(`Select * from tb_user where email = ${db.escape(req.body.email)}`)
                let { idtb_user, username, email, role, idtb_status, otp } = get2[0]
                // Membuat Token
                let token = createToken({ idtb_user, username, email, role, idtb_status })
                let mail = {
                    from: 'Admin IKEA <ssafinatunnajah@gmail.com>', //email pengirim sesuai dengan config nodemailer
                    to: email, //email penerima sesuai data Select dari database
                    subject: '[IKEA-WEB] Re-Verification Email',
                    html: `<div style="text-align: 'center'">
                    <p>Hello, ${username}, Your New OTP: <b>${otp}</b></p>
                    <a href='http://localhost:3000/verification/${token}'>Verification your Email</a></div>`
                }
                // 2. CONFIG TRANSPORTER
                await transporter.sendMail(mail)

                res.status(200).send("Resend Verification Success")
            }
        } catch (error) {
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    }
}
/**
 * BackUp
 * getUsers: (req, res) => {
        let getSQL, dataSearch = []
        for (let prop in req.query) {
            dataSearch.push(`${prop} = ${db.escape(req.query[prop])}`)
        }
        console.log(dataSearch.join(' AND '))
        if (dataSearch.length > 0) {
            getSQL = `Select * from tb_user where ${dataSearch.join(' AND ')};`
        } else {
            getSQL = `Select * from tb_user;`
        }
        db.query(getSQL, (err, result) => {
            if (err) {
                res.status(500).send({ status: 'Error Mysql', message: err })
            }
            res.status(200).send(result)
        })

    },
    login: (req, res) => {
        if (req.body.email && req.body.password) {
            console.log(req.body.email)
            let getSQL = `Select * from tb_user
            where email=${db.escape(req.body.email)} and password=${db.escape(req.body.password)};`
            db.query(getSQL, (err, results) => {
                if (err) {
                    res.status(500).send({ status: 'Error Mysql', message: err })
                }
                if (results.length > 0) {
                    res.status(200).send(results)
                    let token = results[0].idtb_user
                } else {
                    res.status(404).send({ status: 'Error Mysql', message: 'Invalid Email and Password' })
                }
            })
        } else {
            res.status(500).send({ error: true, message: 'Your params not complete' })
        }
    },
    register: (req, res) => {
        let getSQL = `Insert into tb_user (username, email, password)
        values (${db.escape(req.body.username)}, ${db.escape(req.body.email)}, ${db.escape(req.body.password)}) ;`
        db.query(getSQL, (err, results) => {
            if (err) {
                res.status(500).send({ status: 'Error Mysql', message: err })
            } else {
                let getAll = `Select * from tb_user;`
                db.query(getAll, (error, resultAll) => {
                    res.status(201).send(resultAll)
                })
            }
        })
    },
    keepLogin: (req, res) => {
        console.log(req.body)
        if (req.body.id) {
            let getSQL = `Select * from tb_user where
            idtb_user=${db.escape(req.body.id)};`

            db.query(getSQL, (err, results) => {
                if (err) {
                    res.status(500).send({ status: 'Error Mysql Login', messages: err })
                }
                if (results) {
                    res.status(200).send(results)
                } else {
                    res.status(404).send({ status: 'Account Not Found' })
                }
            })
        } else {
            res.status(500).send({ error: true, messages: "Your params not complete" })
        }
    },
    LOGIN YG GABUNG
    login: async (req, res) => {
        try {
            if (req.body.email && req.body.password) {
                let getSQL = `Select * from tb_user
                where email=${db.escape(req.body.email)} and password=${db.escape(req.body.password)};`
                let login = await dbQuery(getSQL)
                let getCart = `Select c.idtb_user, p.idtb_product, p.nama, p.harga, ps.type, ps.qty as qty_stok, ps.idtb_product_stok, c.qty from tb_cart c
                JOIN tb_product p on c.idtb_product = p.idtb_product JOIN tb_product_stok ps on ps.idtb_product_stok = c.idtb_product_stok
                where c.idtb_user = ${login[0].idtb_user}`
                console.log(getCart)
                let getCartLog = await dbQuery(getCart)
                let getImage = `Select * from tb_product_image`
                let getImg = await dbQuery(getImage)
                getCartLog.forEach(item => {
                    item.images = []
                    getImg.forEach(el => {
                        if (item.idtb_product == el.idtb_product) {
                            item.images.push({ idtb_product_image: el.idtb_product_image, images: el.images })
                        }
                    })
                })
                login.forEach(item => {
                    item.cart = []
                    getCartLog.forEach(el => {
                        if (item.idtb_user == el.idtb_user) {
                            item.cart.push(el)
                        }
                    })
                })
                res.status(200).send(login)
            } else {
                res.status(200).send("Your params not complete")
            }
        } catch (error) {
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    },
    KEEPLOGIN GABUNG
    keepLogin: async (req, res) => {
        try {
            if (req.body.id) {
                let getSQL = `Select * from tb_user where
                idtb_user=${db.escape(req.body.id)};`
                let keepLog = await dbQuery(getSQL)
                let getCart = `Select c.idtb_user, p.idtb_product, p.nama, p.harga, ps.type, ps.qty as qty_stok, ps.idtb_product_stok, c.qty from tb_cart c
                JOIN tb_product p on c.idtb_product = p.idtb_product JOIN tb_product_stok ps on ps.idtb_product_stok = c.idtb_product_stok
                where c.idtb_user = ${keepLog[0].idtb_user}`
                console.log(getCart)
                let getCartLog = await dbQuery(getCart)
                let getImage = `Select * from tb_product_image`
                let getImg = await dbQuery(getImage)
                getCartLog.forEach(item => {
                    item.images = []
                    getImg.forEach(el => {
                        if (item.idtb_product == el.idtb_product) {
                            item.images.push({ idtb_product_image: el.idtb_product_image, images: el.images })
                        }
                    })
                })
                keepLog.forEach(item => {
                    item.cart = []
                    getCartLog.forEach(el => {
                        if (item.idtb_user == el.idtb_user) {
                            item.cart.push(el)
                        }
                    })
                })
                res.status(200).send(keepLog)
                // res.status(200).send(keepLog)
                // if (keepLog) {
                //     console.log("Keep Login Success")
                // } else {
                //     res.status(404).send({ status: 'Account Not Found' })
                // }
            }
        } catch (error) {
            res.status(500).send({ status: 'Error Mysql Login', messages: error })
        }
    }
}
*/