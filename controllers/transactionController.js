const { dbQuery } = require('../config/database')

module.exports = {
    getCart: async (req, res, next) => {
        try {
            // data yg diambil: idtb_user, idtb_product, nama, gambar, harga, type,qty(stok), idtb_stok, qty
            let getCartSQL = `Select c.idtb_user, c.idtb_cart, p.idtb_product, p.nama, p.harga, ps.type, ps.qty as qty_stok, ps.idtb_product_stok, c.qty from tb_cart c 
            JOIN tb_product p on c.idtb_product = p.idtb_product JOIN tb_product_stok ps on ps.idtb_product_stok = c.idtb_product_stok 
            where c.idtb_user = ${req.user.idtb_user}`
            let getImage = `Select * from tb_product_image`
            let get = await dbQuery(getCartSQL)
            let getImg = await dbQuery(getImage)
            get.forEach(item => {
                item.images = []
                getImg.forEach(el => {
                    if (item.idtb_product == el.idtb_product) {
                        item.images.push({ idtb_product_image: el.idtb_product_image, images: el.images })
                    }
                })
            })
            res.status(200).send(get)
        } catch (error) {
            next(error)
        }
    },
    addCart: async (req, res, next) => {
        try {
            let addCartSQL = `Insert into tb_cart set ?`
            addCartSQL = await dbQuery(addCartSQL, { idtb_user: req.user.idtb_user, ...req.body })
            res.status(200).send({ status: "Success✅" })
        } catch (error) {
            next(error)
        }
    },
    updateCart: async (req, res, next) => {
        try {
            if (req.body.qty == 0) {
                let del = `Delete from tb_cart where idtb_cart = ${req.body.idtb_cart}`
                del = await dbQuery(del)
                res.status(200).send(del)
            } else {
                let updateSQL = await dbQuery(`Update tb_cart set qty = ${req.body.qty} where idtb_cart = ${req.body.idtb_cart}`)
                res.status(200).send({ status: "Success", results: updateSQL })
            }
        } catch (error) {
            next(error)
        }
    },
    deleteCart: async (req, res, next) => {
        try {
            let del = `Delete from tb_cart where idtb_cart = ${req.params.idtb_cart}`
            del = await dbQuery(del)
            res.status(200).send(del)
        } catch (error) {
            next(error)
        }
    },
    removeCart: async (req, res, next) => {
        try {
            let del = `Delete from tb_cart where idtb_user = ${req.user.idtb_user}`
            del = await dbQuery(del)
            res.status(200).send(del)
        } catch (error) {
            next(error)
        }
    },
    addToTransaction: async (req, res, next) => {
        try {
            let idtb_user= req.user.idtb_user
            let { invoice, ongkir, total_payment, note, detail } = req.body
            let addtrans = `Insert into tb_transaction set ?;`
            addtrans = await dbQuery(addtrans, { invoice, idtb_user,  ongkir, total_payment, note })
            console.log("Checkout success", addtrans)
            let detailQuery = `Insert into tb_transaction_detail (idtb_transaction, idtb_product, idtb_product_stok, qty) values ?`
            let dataDetail = detail.map(item => [addtrans.insertId, item.idtb_product, item.idtb_product_stok, item.qty])
            detailQuery = await dbQuery(detailQuery, [dataDetail])
            console.log("Detail Success", detailQuery)
            let deleteCart = `Delete from tb_cart where (idtb_cart, idtb_user) IN (?) ;`
            let delCart = detail.map(item => [item.idtb_cart, idtb_user])
            deleteCart = await dbQuery(deleteCart, [delCart])
            console.log("Del Success", detailQuery)
            res.status(200).send({ success: true, message: "Checkout Success" })
        } catch (error) {
            next(error)
        }
    },
    getTransaction: async (req, res, next) => {
        try {
            // console.log(req.body)
            // let get = `Select t.*, td.* from tb_transaction t JOIN tb_transaction_detail td on t.idtb_transaction = td.idtb_transaction where idtb_user=${req.params.idtb_user}`
            // let get = `Select t.*, s.status, u.username from tb_transaction t join tb_status s on t.idtb_status = s.idtb_status join tb_user u on u.idtb_user = t.idtb_user ${req.params.idtb_user>0 && `where u.idtb_user=${req.params.idtb_user}`};`
            let get = `Select t.*, s.status, u.username from tb_transaction t join tb_status s on t.idtb_status = s.idtb_status join tb_user u on u.idtb_user = t.idtb_user where u.idtb_user=${req.user.idtb_user};`
            get = await dbQuery(get)
            console.log(get)
            let getDetail = `Select p.nama, p.harga, ps.type, td.* from tb_transaction_detail td JOIN tb_product p on p.idtb_product = td.idtb_product JOIN tb_product_stok ps on ps.idtb_product_stok = td.idtb_product_stok;`
            getDetail = await dbQuery(getDetail)
            console.log("Detail", getDetail)
            get.forEach(item => {
                item.detail = []
                getDetail.forEach(el => {
                    if (item.idtb_transaction == el.idtb_transaction) {
                        item.detail.push(el)
                    }
                })
            })
            res.status(200).send(get)
        } catch (error) {
            next(error)
        }
    },
    getAllTransaction: async (req, res, next) => {
        try {
            let get = `Select t.*, s.status, u.username from tb_transaction t join tb_status s on t.idtb_status = s.idtb_status join tb_user u on u.idtb_user = t.idtb_user;`
            get = await dbQuery(get)
            console.log(get)
            let getDetail = `Select p.nama, p.harga, ps.type, td.* from tb_transaction_detail td JOIN tb_product p on p.idtb_product = td.idtb_product JOIN tb_product_stok ps on ps.idtb_product_stok = td.idtb_product_stok;`
            getDetail = await dbQuery(getDetail)
            console.log(getDetail)
            get.forEach(item => {
                item.detail = []
                getDetail.forEach(el => {
                    if (item.idtb_transaction == el.idtb_transaction) {
                        item.detail.push(el)
                    }
                })
            })
            res.status(200).send(get)
        } catch (error) {
            next(error)
        }
    },
    PaidBtn: async (req, res, next) => {
        try {
            let id = req.params.id
            let update = `Update tb_transaction set idtb_status = 7 where idtb_transaction = ${id}`
            update = await dbQuery(update)
            res.status(200).send(update)
        } catch (error) {
            next(error)
        }
    },
    ConfirmBtn: async (req, res, next) => {
        try {
            let id = req.params.id
            let update = `Update tb_transaction set idtb_status = 8 where idtb_transaction = ${id}`
            update = await dbQuery(update)
            res.status(200).send(update)
        } catch (error) {
            next(error)
        }
    },
    getIdCtg: async (req, res, next) => {
        try {
            let id = `SELECT c1.idtb_category, c1.category FROM tb_category c1
                LEFT JOIN tb_category c2 ON c2.parent_id = c1.idtb_category
                WHERE c2.idtb_category IS NULL;`
            id = await dbQuery(id)
            res.status(200).send(id)
        } catch (error) {
            next(error)
        }
    }
}

/**
 * UNPAID -> PAID CONFIRM -> PROCESSED
 * addToTransaction: async (req, res, next) => {
        try {
            let addtrans = `Insert into tb_transaction (invoice, date, idtb_user, ongkir, total_payment, note) values ('${req.body.invoice}', '${req.body.date}', ${req.body.idtb_user}, ${req.body.ongkir}, ${req.body.total_payment}, '${req.body.note}');`
            addtrans = await dbQuery(addtrans)
            if (addtrans.insertId) {
                let addTransDetail = `Insert into tb_transaction_detail
                values (null, ${addtrans.insertId}, ${req.body.idtb_product}, ${req.body.idtb_product_stok}, ${req.body.qty});`
                let addTransDetails = await dbQuery(addTransDetail)
            }
            res.status(200).send({ status: "Success", results: addtrans })
        } catch (error) {
            next(error)
        }
    },
*/