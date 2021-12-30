module.exports = (sequelize, DataTypes) => {
    const TransactionItems = sequelize.define('TransactionItems', {
        quantity: DataTypes.INTEGER,
        unitPrice: DataTypes.DOUBLE,
        totalPrice: DataTypes.DOUBLE,
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
