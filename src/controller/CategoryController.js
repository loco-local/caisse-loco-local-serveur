const {Categories} = require('../model')
module.exports = {
    async list(req, res) {
        const categories = await Categories.findAll();
        res.send(categories);
    },
    async createCategory(req, res) {
        const newCategory = await Categories.create({
            priority: -1
        });
        res.send({
            id: newCategory.id,
            createdAt: newCategory.createdAt
        });
    },
    async updatePriority(req, res) {
        const categoryId = parseInt(req.params.categoryId)
        await Categories.update(
            {
                priority: req.body.priority
            },
            {
                where: {
                    id: categoryId
                }
            });
        res.sendStatus(200);
    },
    async updateName(req, res) {
        const categoryId = parseInt(req.params.categoryId)
        await Categories.update(
            {
                name: req.body.name,
            },
            {
                where: {
                    id: categoryId
                }
            }
        );
        res.sendStatus(200);
    }
}
