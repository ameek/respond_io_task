import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

class NoteVersion extends Model {
    static associate(models) {
      NoteVersion.belongsTo(models.Note, {
        foreignKey: 'noteId',
        as: 'note',
      });
      NoteVersion.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }

NoteVersion.init(
  {
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'NoteVersion',
  }
);

export default NoteVersion;