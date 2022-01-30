const express = require('express')
const router = express.Router()

const UserController = require('../controller/UserController')
//
const TransactionController = require('../controller/TransactionController')
const ProductController = require('../controller/ProductController')
const CategoryController = require('../controller/CategoryController')
const isAuthenticated = require('../policy/isAuthenticated')
const isAdmin = require('../policy/isAdmin')

// router.post(
//   '/api/register',
//   AuthenticationControllerPolicy.register,
//   AuthenticationController.register
// )

router.get(
    '/user',
    UserController.list
)

router.get(
    '/user/:userId',
    UserController.get
)

router.post(
    '/user',
    UserController.createUser
)

router.put(
    '/user/:userId',
    UserController.updateUser
)

router.get(
    '/product',
    ProductController.list
)

router.get(
    '/product/available',
    ProductController.listAvailable
)

router.get(
    '/product/:productId',
    ProductController.getDetails
)

router.put(
    '/product/:productId',
    ProductController.updateProduct
)

router.post(
    '/product',
    ProductController.createProduct
)

router.get(
    '/:userId/transaction',
    TransactionController.listForUser
)

router.post(
    '/:userId/transaction',
    TransactionController.prepaidAccountTransaction
)
//
// router.get(
//     '/:ownerId/transaction/:transactionId',
//     isOwnerArdoiseUserOrAdmin,
//     TransactionController.transactionDetails
// )
router.post(
    '/transaction',
    TransactionController.anonymousTransaction
)

router.get(
    '/transactions/details',
    TransactionController.listAllDetails
)

router.delete(
    '/transaction/:transactionId',
    isAdmin,
    TransactionController.removeTransaction
)

router.post(
    '/transaction/fund',
    TransactionController.addFund
)

router.get(
    '/category',
    CategoryController.list
)

router.post(
    '/category',
    CategoryController.createCategory
)

router.put(
    '/category/priority/:categoryId',
    CategoryController.updatePriority
)

router.put(
    '/category/name/:categoryId',
    CategoryController.updateName
)


module.exports = router
