/* eslint-disable indent */
const IMAGE_WIDTH = 500
const IMAGE_BASE_PATH = '/home/caisse.loco-local.net/image'
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
    async list(req, res) {
        const products = await Products.findAll({
            include: [
                {model: Categories, as: 'category'},
            ]
        });
        res.send(products);
    },
    async getDetails(req, res) {
        const productId = parseInt(req.params['productId'])
        const product = await Products.findOne({
            where: {
                id: productId
            }
        });
        res.send(product);
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
    async updateProduct(req, res) {
        let product = req.body
        if (product.id !== parseInt(req.params['productId'])) {
            return res.sendStatus(401)
        }
        if (!product.nbInStock || product.nbInStock === '') {
            product.nbInStock = 0
        }
        await Products.update({
            name: product.name,
            description: product.description,
            isTaxable: product.isTaxable,
            price: product.price,
            isPriceInKg: product.isPriceInKg,
            nbInStock: product.nbInStock,
            isAvailable: product.isAvailable,
            hasDecimalQuantity: product.hasDecimalQuantity,
            isActivity: product.isActivity
        }, {
            where: {
                id: product.id
            }
        });
        res.send();
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
