import { DataTypes } from 'sequelize';
import type { Migration } from '../index';

const { INTEGER, STRING, DATE, TEXT } = DataTypes;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('snippets', {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    title: { type: STRING, allowNull: false },
    description: { type: TEXT, allowNull: true, defaultValue: '' },
    language: { type: STRING, allowNull: false },
    code: { type: TEXT, allowNull: false },
    docs: { type: TEXT, allowNull: true, defaultValue: '' },
    createdAt: { type: DATE, allowNull: false },
    updatedAt: { type: DATE, allowNull: false }
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('snippets');
};
