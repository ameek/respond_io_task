import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

class User extends Model {
  static associate(models) {
    User.hasMany(models.Note, { foreignKey: 'userId', as: 'notes' });
  }
}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
  }
);

export default User;