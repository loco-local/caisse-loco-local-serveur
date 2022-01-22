const express = require('express')
const router = express.Router()
const AuthenticationController = require('../controller/AuthenticationController')

const AuthenticationControllerPolicy = require('../policy/AuthenticationControllerPolicy')

const UserController = require('../controller/UserController')
//
const TransactionController = require('../controller/TransactionController')
const ProductController = require('../controller/ProductController')
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


router.post(
    '/login',
    AuthenticationController.login
)

router.post(
    '/reset-password',
    AuthenticationController.resetPassword
)

router.post(
    '/token-valid',
    AuthenticationController.isTokenValid
)

router.post(
    '/change-password',
    AuthenticationController.changePassword
)
router.get(
    '/product/available',
    ProductController.listAvailable
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
    '/transactions/details/:year',
    isAdmin,
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

module.exports = router
