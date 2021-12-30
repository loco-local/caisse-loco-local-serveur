module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define('Transactions', {
        totalPrice: DataTypes.DOUBLE,
        balance: DataTypes.DOUBLE,
    }, {
        paranoid: true
    })
    Transactions.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Users)
        model.hasMany(models.TransactionItems, {as: 'items'})
    }
    return Transactions
}
