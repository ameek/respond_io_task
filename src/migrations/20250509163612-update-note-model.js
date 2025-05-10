export const up = async (queryInterface, Sequelize) => {
  // Add full-text index to title and content
  await queryInterface.addIndex('Notes', ['title', 'content'], {
    name: 'note_fulltext_idx',
    type: 'FULLTEXT',
  });
};

export const down = async (queryInterface) => {
  // Remove the full-text index
  await queryInterface.removeIndex('Notes', 'note_fulltext_idx');
};