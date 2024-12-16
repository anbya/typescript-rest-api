import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
import {sequelizeConfig} from '../config/seqDB'

export interface CustomModel extends ModelStatic<Model> {
    associate?: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const basename = path.basename(__filename);
const db: { [key: string]: ModelStatic<Model> } & { sequelize: Sequelize, Sequelize: typeof Sequelize } = {} as any;

let sequelize: Sequelize;
sequelize = sequelizeConfig;

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.ts';
  })
  .forEach((file) => {
    const modelModule = require(path.join(__dirname, file));
    const model = modelModule.default ? modelModule.default(sequelize, DataTypes) : modelModule(sequelize, DataTypes);

    if (model && model.name) {
      db[model.name] = model;
    } else {
      console.error(`Model in file ${file} does not have a valid name or initialization.`);
    }
  });

  Object.keys(db).forEach((modelName) => {
    const model = db[modelName] as CustomModel;
    if (model.associate) {
      model.associate(db);
    }
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
