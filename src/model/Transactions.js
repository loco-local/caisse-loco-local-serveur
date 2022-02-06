module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define('Transactions', {
        totalPrice: DataTypes.DOUBLE,
        balance: DataTypes.DOUBLE,
        paymentMethod: DataTypes.STRING,
        personName: DataTypes.STRING
    }, {
        paranoid: true
    })
    Transactions.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Users)
        model.hasMany(models.TransactionItems, {as: 'items'})
    }
    return Transactions
}
