import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Note extends Model {
  static associate(models) {
    Note.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Note.hasMany(models.NoteVersion, {
      foreignKey: 'noteId',
      as: 'versions',
    });
  }
}

Note.init(
  {
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
      // Optional: Add full-text index later via migration
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Note",
    indexes: [
      {
        name: "note_fulltext_idx",
        using: "FULLTEXT",
        fields: ["title", "content"],
      },
    ],
  }
);

export default Note;
