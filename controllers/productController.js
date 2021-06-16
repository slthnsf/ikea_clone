const fs = require('fs')
const { db, dbQuery, uploader } = require('../config')

module.exports = {
    addProduct: async (req, res, next) => {
        try {
            // let addSQL = `Insert into tb_product (nama, brand, deskripsi, harga, idtb_status) 
            // values (${db.escape(req.body.nama)}, ${db.escape(req.body.brand)}, 
            // ${db.escape(req.body.deskripsi)}, ${db.escape(req.body.harga)}, ${db.escape(req.body.idtb_status)});`
            // let addImage = `Insert into tb_product_image values `
            // let addStok = `Insert into tb_product_stok values `

            // // get all idtb_category dari child-> parent
            // let getCategory = `with recursive category_leaf (idtb_category, category, parent_id) as
            // (
            //     Select idtb_category, category, parent_id
            //     from tb_category where idtb_category = ${req.body.idtb_category}
            //     UNION ALL
            //     Select c.idtb_category, c.category, c.parent_id from category_leaf cl join tb_category c
            //     on cl.parent_id = c.idtb_category
            // )
            // Select * from category_leaf;`
            // let getCtg = await dbQuery(getCategory)
            // console.log(getCtg)


            // let add = await dbQuery(addSQL)
            // if (add.insertId) {
            //     getCtg = getCtg.map(item => [add.insertId, item.idtb_category])
            //     await dbQuery(`insert into tb_product_category (idtb_product, idtb_category) values ?`, [getCtg])


            //     let queryStok = []
            //     req.body.stok.forEach(item => {
            //         queryStok.push(`(null, ${add.insertId}, ${db.escape(item.qty)}, ${db.escape(item.type)}, ${db.escape(req.body.idtb_status)})`)
            //     })
            //     let addStk = await dbQuery(addStok + queryStok)

            //     // upload image
            //     let queryImage = []
            //     req.body.images.forEach(item => {
            //         queryImage.push(`(null, ${add.insertId}, ${db.escape(item)})`)
            //     })
            //     let addImg = await dbQuery(addImage + queryImage)
                
                const upload = uploader('/images', 'IMG').fields([{ name: 'images' }])

                upload(req, res, (error) => {
                    if(error) {
                        next(error)
                    }

                    const { images } = req.files
                    console.log("cek file upload", images)
                    console.log(JSON.parse(req.body.data))
                })
                // res.status(200).send("Insert Success")
            // }
        } catch (error) {
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    },
    getProduct: async (req, res) => {
        try {
            let dataSearch = [], getSQL
            let getImage = `Select * from tb_product_image`
            // let getStok = `Select * from tb_product_stok`
            let getStok = `Select ps.*, s.status from tb_product_stok ps join tb_status s on ps.idtb_status = s.idtb_status`
            for (let prop in req.query) {
                dataSearch.push(`${prop} = ${db.escape(req.query[prop])}`)
            }
            console.log(dataSearch.join(' AND '))
            if (dataSearch.length > 0) {
                // getSQL = `Select * from tb_product where ${dataSearch.join(' AND ')};`
                getSQL = `Select * from tb_product p join tb_status s on p.idtb_status = s.idtb_status where ${dataSearch.join(' AND ')};`
            } else {
                // getSQL = `Select * from tb_product;`
                getSQL = `Select p.*, s.status from tb_product p join tb_status s on p.idtb_status = s.idtb_status where p.idtb_status = 1;`
            }

            let get = await dbQuery(getSQL)
            let getImg = await dbQuery(getImage)
            let getStk = await dbQuery(getStok)
            // Looping result data product untuk ambil image dari tb lain
            get.forEach(item => {
                item.images = []
                getImg.forEach(el => {
                    if (item.idtb_product == el.idtb_product) {
                        item.images.push(el)
                    }
                })

                item.stok = []
                getStk.forEach(el => {
                    if (item.idtb_product == el.idtb_product) {
                        item.stok.push({ idtb_product_stok: el.idtb_product_stok, type: el.type, qty: el.qty, status: el.status })
                    }
                })
            })
            res.status(200).send(get)
        } catch (error) {
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    },
    updateProduct: async (req, res) => {
        try {
            let id = req.params.id
            let { nama, brand, deskripsi, harga, idtb_status, images, stok } = req.body
            let body = req.body
            let updateSQL, updateImg, updateStok = []
            updateImg = images.map(item => `Update tb_product_image set images = ${db.escape(item.images)} where idtb_product_image = ${item.idtb_product_image};`)
            console.log(updateImg.join('\n'))
            updateStok = stok.map(item => `Update tb_product_stok set qty = ${item.qty}, type = ${db.escape(item.type)} where idtb_product_stok = ${item.idtb_product_stok};`)
            updateSQL = `Update tb_product set nama = ${db.escape(nama)}, brand = ${db.escape(brand)}, deskripsi = ${db.escape(deskripsi)},
            harga = ${db.escape(harga)}, idtb_status = ${db.escape(idtb_status)} where idtb_product = ${id};
            ${updateImg.join('\n')}
            ${updateStok.join('\n')}`
            console.log(updateSQL)

            await dbQuery(updateSQL)
            res.status(200).send("Update Product, Image and Stok Success!")
        } catch (error) {
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    },
    deleteProduct: async (req, res) => {
        try {
            let id = req.params.id
            let updateSQL = `Update tb_product set idtb_status = 2 where idtb_product = ${id};`
            console.log(updateSQL)
            let del = await dbQuery(updateSQL)
            res.status(200).send(del)

        } catch (error) {
            res.status(500).send({ status: 'Error Mysql', message: error })
        }
    }
}

/**
 * BackUp
 * updateProduct: (req, res) => {
        let id = req.params.id
        let { nama, brand, deskripsi, harga, idtb_status, images, stok } = req.body
        let body = req.body
        let updateSQL, updateImg, updateImg2, updateStok, updateStok2, dataUpdate = []
        if (body) {
            updateSQL = `Update tb_product set nama = ${db.escape(nama)}, brand = ${db.escape(brand)}, deskripsi = ${db.escape(deskripsi)},
            harga = ${db.escape(harga)}, idtb_status = ${db.escape(idtb_status)} where idtb_product = ${id};`
            console.log(updateSQL)
            console.log(body.images[0].images)

            db.query(updateSQL, (err, result) => {
                if (err) {
                    res.status(500).send({ status: 'Error Mysql', message: err })
                }
                updateImg = images.map(item => `Update tb_product_image set images = ${db.escape(item.images)} where idtb_product_image = ${item.idtb_product_image};`)
                console.log(updateImg.join('\n'))
                updateStok = stok.map(item => `Update tb_product_stok set qty = ${item.qty}, type = ${db.escape(item.type)} where idtb_product_stok = ${item.idtb_product_stok};`)
                console.log(updateStok.join('\n'))
                // updateImg = `Update tb_product_image set images = ${db.escape(body.images[0].images)} where idtb_product_image = ${body.images[0].idtb_product_image}`
                db.query(updateImg.join('\n') + updateStok.join('\n'), (err_img, result_img) => {
                    if (err_img) {
                        res.status(500).send({ status: 'Error Mysql', message: err_img })
                    }
                    res.status(200).send("Update Product, Image and Stok Success!")


                })
            })
        }
    },
    deleteProduct: (req, res) => {
        let id = req.params.id
        let updateSQL = `Update tb_product set idtb_status = 2 where idtb_product = ${id};`
        console.log(updateSQL)
        db.query(updateSQL, (err, result) => {
            if (err) {
                res.status(500).send({ status: 'Error Mysql', message: err })
            }
            res.status(200).send(result)
        })
    },
    updateProduct: (req, res) => {
        let id = req.params.id
        let { nama, brand, deskripsi, harga, idtb_status, images, stok } = req.body
        let body = req.body
        let updateSQL, updateImg, updateStok = []
        if (body) {
            updateImg = images.map(item => `Update tb_product_image set images = ${db.escape(item.images)} where idtb_product_image = ${item.idtb_product_image};`)
            console.log(updateImg.join('\n'))
            updateStok = stok.map(item => `Update tb_product_stok set qty = ${item.qty}, type = ${db.escape(item.type)} where idtb_product_stok = ${item.idtb_product_stok};`)
            updateSQL = `Update tb_product set nama = ${db.escape(nama)}, brand = ${db.escape(brand)}, deskripsi = ${db.escape(deskripsi)},
            harga = ${db.escape(harga)}, idtb_status = ${db.escape(idtb_status)} where idtb_product = ${id};
            ${updateImg.join('\n')}
            ${updateStok.join('\n')}`
            console.log(updateSQL)
            db.query(updateSQL, (err, result) => {
                if (err) {
                    res.status(500).send({ status: 'Error Mysql', message: err })
                }
                res.status(200).send("Update Product, Image and Stok Success!")
            })
        }
    },
    addProduct: (req, res) => {
        let addSQL = `Insert into tb_product (nama, brand, deskripsi, harga, idtb_status)
        values (${db.escape(req.body.nama)}, ${db.escape(req.body.brand)},
        ${db.escape(req.body.deskripsi)}, ${db.escape(req.body.harga)}, ${db.escape(req.body.idtb_status)});`
        let addImage = `Insert into tb_product_image values `
        let addStok = `Insert into tb_product_stok values `

        db.query(addSQL, (err, result) => {
            if (err) {
                res.status(500).send({ status: 'Error Mysql', message: err })
            } else if (result.insertId) {
                let queryImage = []
                req.body.images.forEach(item => {
                    queryImage.push(`(null, ${result.insertId}, ${db.escape(item)})`)
                })
                let queryStok = []
                req.body.stok.forEach(item => {
                    queryStok.push(`(null, ${result.insertId}, ${db.escape(item.qty)}, ${db.escape(item.type)}, ${db.escape(req.body.idtb_status)})`)
                })
                db.query(addImage + queryImage, (err_img, result_img) => {
                    if (err_img) {
                        res.status(500).send({ status: 'Error Mysql', message: err_img })
                    }
                    db.query(addStok + queryStok, (err_stok, result_stok) => {
                        if (err_stok) {
                            res.status(500).send({ status: 'Error Mysql', message: err_stok })
                        }
                        res.status(200).send("Insert Success")
                    })
                })
            }
        })
    },
*/