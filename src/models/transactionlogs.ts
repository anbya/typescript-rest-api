import { Model, DataTypes, Sequelize } from 'sequelize';

export class TransactionLogs extends Model {
  transaction_id!: string;
  username!: string;
  timestamp!: Date;
  table_name!: string;
  row_id!: string;
  column_name!: string;
  old_value!: string;
  new_value!: string;
  operation!: string;
  status!: string;
  row_id_column_name!: string;
  
  static associate(models: any) {
  }
}

export default (sequelize: Sequelize) => {
  TransactionLogs.init(
    {
      transaction_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      table_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      row_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      column_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      old_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      new_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      operation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      row_id_column_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'TransactionLogs',
      timestamps: false,
      paranoid: true,
    }
  );

  return TransactionLogs;
};
