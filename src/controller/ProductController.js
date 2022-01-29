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
    async createProduct(req, res) {
        let product = req.body
        if (!product.nbInStock || product.nbInStock === '') {
            product.nbInStock = 0
        }
        product = await Products.create({
            name: product.name,
            description: product.description,
            isTaxable: product.isTaxable,
            price: product.price,
            isPriceInKg: product.isPriceInKg,
            nbInStock: product.nbInStock,
            isAvailable: product.isAvailable,
            hasDecimalQuantity: product.hasDecimalQuantity,
            isActivity: product.isActivity,
            CategoryId: product.CategoryId
        })
        res.send({
            id: product.id
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
            isActivity: product.isActivity,
            CategoryId: product.CategoryId
        }, {
            where: {
                id: product.id
            }
        });
        res.send();
    }
}
