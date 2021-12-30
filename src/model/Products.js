module.exports = (sequelize, DataTypes) => {
    const Products = sequelize.define('Products', {
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        price: DataTypes.DOUBLE,
        isPriceInKg: DataTypes.BOOLEAN,
        taxable: DataTypes.BOOLEAN,
        image: DataTypes.JSONB,
        nbInStock: DataTypes.DOUBLE,
        isUserDefinedPrice: DataTypes.BOOLEAN,
        isAvailable: DataTypes.BOOLEAN,
        hasDecimalQuantity: DataTypes.BOOLEAN
    })

    Products.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Categories, {
            as: 'category',
            foreignKey: {
                name: 'CategoryId'
            }
        });
    };
    return Products;
}
