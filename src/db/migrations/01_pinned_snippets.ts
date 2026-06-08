import { DataTypes } from 'sequelize';
import type { Migration } from '../index';

const { INTEGER } = DataTypes;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('snippets', 'isPinned', {
    type: INTEGER,
    allowNull: true,
    defaultValue: 0
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('snippets', 'isPinned');
};
