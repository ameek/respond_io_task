import { Sequelize } from 'sequelize';

export const up = async (queryInterface) => {
  await queryInterface.createTable('Notes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
    },
    version: {
      type: Sequelize.INTEGER,
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('Notes');
};