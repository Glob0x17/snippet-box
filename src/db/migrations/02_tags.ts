import { DataTypes } from 'sequelize';
import type { Migration } from '../index';
import { Logger } from '../../utils';
import {
  SnippetModel,
  Snippet_TagModel,
  TagInstance,
  TagModel
} from '../../models';

const { STRING, INTEGER } = DataTypes;
const logger = new Logger('migration[02]');

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('tags', {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: { type: STRING, allowNull: false, unique: true }
  });

  await queryInterface.createTable('snippets_tags', {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    snippet_id: { type: INTEGER, allowNull: false },
    tag_id: { type: INTEGER, allowNull: false }
  });

  const snippets = await SnippetModel.findAll();
  if (snippets.length === 0) return;

  const uniqueLanguages = [...new Set(snippets.map(s => s.language))];
  const tags: TagInstance[] = [];

  for (const language of uniqueLanguages) {
    try {
      tags.push(await TagModel.create({ name: language }));
    } catch {
      logger.log(`Skipping tag '${language}' (already exists?)`, 'WARN');
    }
  }

  for (const snippet of snippets) {
    const tag = tags.find(t => t.name === snippet.language);
    if (tag) {
      await Snippet_TagModel.create({
        snippet_id: snippet.id,
        tag_id: tag.id
      });
    }
  }
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('tags');
  await queryInterface.dropTable('snippets_tags');
};
