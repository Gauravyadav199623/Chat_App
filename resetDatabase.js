const sequelize = require('./util/database');
const User = require('./models/user');
const Group = require('./models/group');
const UserAndGroup = require('./models/userGroup');

const tablesInDropOrder = [UserAndGroup,User, Group ];

const dropTable = async (model) => {
  try {
    if (model.associations) {
      for (const association of Object.values(model.associations)) {
        await sequelize.getQueryInterface().removeConstraint(model.getTableName(), association.foreignKey);
      }
    }

    await model.sync({ force: true });
    console.log(`Table ${model.name} dropped successfully.`);
  } catch (error) {
    console.error(`Error dropping table ${model.name}:`, error);
  }
};

const dropTablesSequentially = async () => {
  for (const model of tablesInDropOrder) {
    await dropTable(model);
  }
};

dropTablesSequentially();
