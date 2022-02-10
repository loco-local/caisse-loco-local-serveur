module.exports = (sequelize, DataTypes) => {
    const Products = sequelize.define('Products', {
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        price: DataTypes.DOUBLE,
        isPriceInKg: DataTypes.BOOLEAN,
        isTaxable: DataTypes.BOOLEAN,
        image: DataTypes.JSONB,
        nbInStock: DataTypes.DOUBLE,
        isActivity: DataTypes.BOOLEAN,
        isOther: DataTypes.BOOLEAN,
        isAvailable: DataTypes.BOOLEAN,
        hasDecimalQuantity: DataTypes.BOOLEAN,
        accountingCategoryId: DataTypes.INTEGER
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
