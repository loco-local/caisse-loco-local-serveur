const {Users, Transactions} = require('../model')
const uuid = require('uuid');
const AuthenticationController = require('./AuthenticationController')
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
    async createMember(req, res) {
        if (req.user.status !== 'admin') {
            return res.send(401);
        }
        let member = req.body;
        member.email = member.email.toLowerCase();
        delete member.password;
        let user = await Users.findOne({
            where: {
                email: member.email
            }
        });
        if (user) {
            return res.status(403).send({
                error: 'Register information is incorrect'
            })
        }
        member.uuid = uuid();
        member.region = "BDC";
        member = await Users.create(
            member
        );
        await UserController._createInitialTransactionForMemberId(member.id);
        const passwordToken = await AuthenticationController._resetPassword(member.email);
        res.send({
            passwordToken: passwordToken
        });
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
    async updateMember(req, res) {
        let member = req.body;
        if (member.id !== req.user.id && req.user.status !== 'admin') {
            return res.send(403);
        }
        const updateInfo = {
            firstname: member.firstname,
            lastname: member.lastname,
            email: member.email,
            facebookId: member.facebookId,
            subRegion: member.subRegion,
            phone1: member.phone1,
            phone2: member.phone2,
            pronoun: member.pronoun,
            address: member.address,
            contactByEmail: member.contactByEmail,
            contactByMessenger: member.contactByMessenger,
            contactByPhone: member.contactByPhone,
            preferredCommunication: member.preferredCommunication,
            language: member.language
        };
        if (req.user.status === 'admin') {
            updateInfo.status = member.status;
            updateInfo.OrganisationId = member.OrganisationId;
            updateInfo.AdminUserId = member.AdminUserId;
        }
        member = await Users.update(
            updateInfo,
            {
                where: {
                    id: member.id,
                    uuid: req.params.uuid
                }
            });
        res.send(member);
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
