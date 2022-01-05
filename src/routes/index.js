const express = require('express')
const router = express.Router()
const AuthenticationController = require('../controller/AuthenticationController')

const AuthenticationControllerPolicy = require('../policy/AuthenticationControllerPolicy')

// const UserController = require('../controller/UserController')
//
const TransactionController = require('../controller/TransactionController')
const MemberController = require('../controller/MemberController')
const ProductController  = require('../controller/ProductController')
const isAuthenticated = require('../policy/isAuthenticated')
const isAdmin = require('../policy/isAdmin')

// router.post(
//   '/api/register',
//   AuthenticationControllerPolicy.register,
//   AuthenticationController.register
// )

router.post(
    '/login',
    AuthenticationController.login
)

router.post(
    '/login/facebook',
    AuthenticationController.facebookLogin
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
    '/member',
    isAuthenticated,
    MemberController.list
)

router.post(
    '/member',
    isAdmin,
    MemberController.createMember
)

router.get(
    '/member/count',
    isAdmin,
    MemberController.getNbMembers
)

router.get(
    '/member/:memberId',
    isAuthenticated,
    MemberController.get
)

router.put(
    '/member/:uuid',
    isAuthenticated,
    MemberController.updateMember
)


router.get(
    '/product/available',
    ProductController.listAvailable
)


// router.get(
//     '/:ownerId/transaction',
//     isOwnerArdoiseUserOrAdmin,
//     TransactionController.list
// )
//
// router.post(
//     '/:ownerId/transaction',
//     isOwnerArdoiseUserOrAdmin,
//     TransactionController.subscriberTransaction
// )
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
    isAdmin,
    TransactionController.addFund
)

module.exports = router
