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
        isDonation: DataTypes.BOOLEAN,
        isAvailable: DataTypes.BOOLEAN,
        hasDecimalQuantity: DataTypes.BOOLEAN,
        accountingCategoryId: DataTypes.STRING,
        requiresBuyerName: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
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
