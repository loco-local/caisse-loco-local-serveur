/* eslint-disable indent */
const IMAGE_WIDTH = 500
const IMAGE_BASE_PATH = '/home/caisse.loco-local.net/var/lib/popa/image'
const {Products, Categories} = require('../model')
const uuid = require('uuid')
const sharp = require('sharp')
const fs = require('fs')
module.exports = {
    listAvailable(req, res) {
        return Products.findAll({
            where: {
                isAvailable: true
            },
            include: [
                {model: Categories, as: 'category'},
            ],
            order: [
                ['nbInStock', 'DESC']
            ]
        }).then(function (products) {
            res.send(products)
        })
    },
    list(req, res) {
        return Products.findAll().then(function (products) {
            res.send(products)
        })
    },
    getDetails(req, res) {
        const productId = parseInt(req.params['productId'])
        return Products.findOne({
            where: {
                id: productId
            }
        }).then(function (product) {
            res.send(product)
        })
    },
    createProduct(req, res) {
        const product = req.body
        if (!product.nbInStock || product.nbInStock === '') {
            product.nbInStock = 0
        }
        return Products.create({
            name: product.name,
            image: product.image,
            format: product.format,
            description: product.description,
            unitPrice: product.unitPrice,
            nbInStock: product.nbInStock,
            isAvailable: product.isAvailable,
            type: 'open'
        }).then(function (product) {
            res.send(product)
        })
    },
    updateProduct(req, res) {
        const product = req.body
        if (!product.nbInStock || product.nbInStock === '') {
            product.nbInStock = 0
        }
        return Products.update({
            name: product.name,
            image: product.image,
            format: product.format,
            description: product.description,
            unitPrice: product.unitPrice,
            nbInStock: product.nbInStock,
            isAvailable: product.isAvailable
        }, {
            where: {
                id: product.id
            }
        }).then(function (product) {
            res.send(product)
        })
    },
    updateProductAvailability(req, res) {
        const product = req.body
        Products.update({
            isAvailable: product.isAvailable
        }, {
            where: {
                id: product.id
            }
        }).then(function (product) {
            res.send(product)
        })
    },
    updateProductPrice(req, res) {
        const product = req.body
        Products.update({
            unitPrice: product.unitPrice
        }, {
            where: {
                id: product.id
            }
        }).then(function (product) {
            res.send(product)
        })
    },
    uploadImage(req, res) {
        if (!req.files || !req.files.photos) {
            return res.status(400).send('No files were uploaded.')
        }

        let uploadedFile = req.files.photos
        const imageInfo = {
            originalName: uploadedFile.name,
            fileName: uuid(),
            mimetype: uploadedFile.mimetype
        }
        const fullSizeImagePath = IMAGE_BASE_PATH + '/fullsize/' + imageInfo.fileName
        uploadedFile.mv(fullSizeImagePath, function (err) {
            if (err) {
                return res.status(500).send(err)
            }
            sharp(fullSizeImagePath).resize(
                IMAGE_WIDTH
            ).toFile(IMAGE_BASE_PATH + '/thumb/' + imageInfo.fileName, (err, info) => {
                    if (err) {
                        throw err
                    }
                    console.log('resized image to fit within 200x200px')
                }
            )
            res.send(imageInfo)
        })
    },
    getImage(req, res) {
        const secureFileName = req.params['uuid'].split('/').pop()
        const img = fs.readFileSync(IMAGE_BASE_PATH + '/thumb/' + secureFileName)
        res.writeHead(200, {'Content-Type': 'image/jpg'})
        res.end(img, 'binary')
    }
}
