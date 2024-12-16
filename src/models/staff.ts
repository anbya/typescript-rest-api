import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface StaffAttributes {
  id: number;
  userId: string;
  password: string;
  sector: string;
  tripCreated: number;
  status: boolean;
}

interface StaffCreationAttributes extends Optional<StaffAttributes, 'id'> {}

class Staff extends Model<StaffAttributes, StaffCreationAttributes> implements StaffAttributes {
  public id!: number;
  public userId!: string;
  public password!: string;
  public sector!: string;
  public tripCreated!: number;
  public status!: boolean;

  static associate(models: any) {
    // Define associations here
  }
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Staff.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      sector: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      tripCreated: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Staff', // Ensure this is set to 'Staff'
      tableName: 'Staffs',
      timestamps: true,
      paranoid: true,
    }
  );

  return Staff;
};
