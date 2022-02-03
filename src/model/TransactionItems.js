module.exports = (sequelize, DataTypes) => {
    const TransactionItems = sequelize.define('TransactionItems', {
        quantity: DataTypes.INTEGER,
        price: DataTypes.DOUBLE,
        totalPrice: DataTypes.DOUBLE,
        info: DataTypes.JSON,
        tvq: DataTypes.DOUBLE,
        tps: DataTypes.DOUBLE,
        totalPriceAfterRebate: DataTypes.DOUBLE,
        rebates: DataTypes.JSON
    }, {
        paranoid: true,
        indexes: [{
            fields: ['updatedAt']
        }]
    })
    /*
    rebates:[{
      amount: DataTypes.DOUBLE,
      code: Datatypes.String
    }]
    */
    TransactionItems.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Products)
        model.belongsTo(models.Transactions)
    }
    return TransactionItems
}
