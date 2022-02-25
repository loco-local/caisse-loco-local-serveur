const {Users, Transactions} = require('../model')
const UserController = {
    async list(req, res) {
        let attributes = [
            "id",
            "firstname",
            "lastname",
            "balance",
            "createdAt",
            "latestTransaction"
        ];
        if (req.user && req.user.status === 'admin') {
            attributes = attributes.concat([
                "email",
                "status"
            ])
        }
        let members = await Users.findAll({
            attributes: attributes,
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.send(members);
    },
    async createUser(req, res) {
        let info = req.body;
        let user;
        if (info.email !== null && info.email !== undefined) {
            info.email = info.email.toLowerCase();
            user = await Users.findOne({
                where: {
                    email: info.email
                }
            });
            if (user) {
                return res.status(403).send({
                    error: 'Register information is incorrect'
                })
            }
        }
        if (info.email === "") {
            info.email = null;
        }
        delete info.password;
        user = await Users.create(
            info
        );
        res.send({
            id: user.id
        })
    },
    async get(req, res) {
        const userId = req.params['userId']
        let attributes = Users.getSafeAttributes();
        const user = await Users.findOne({
            attributes: attributes,
            where: {
                id: userId
            }
        });
        res.send(user);
    },
    async updateUser(req, res) {
        let user = req.body;
        if (user.id !== parseInt(req.params['userId'])) {
            return res.send(401);
        }
        const updateInfo = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            address: user.address,

        };
        await Users.update(
            updateInfo,
            {
                where: {
                    id: user.id
                }
            });
        res.sendStatus(200);
    },
    async getNbMembers(req, res) {
        const nbMembers = await Users.count();
        //remove one member who is the facebook user test
        res.send({
            'nbMembers': nbMembers - 1
        });
    },
    async _createInitialTransactionForMemberId(memberId) {
        await Transactions.create({
            amount: 5,
            details: "initial",
            GiverId: memberId,
            confirmDate: new Date(),
            status: "CONFIRMED",
            balanceGiver: 5
        });
    }
};
module.exports = UserController;
