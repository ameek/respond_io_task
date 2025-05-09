export const up = async (queryInterface) => {
  await queryInterface.bulkInsert('Notes', [
    {
      userId: 1,
      title: 'First Note',
      content: 'This is the content of the first note.',
      version: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: 2,
      title: 'Second Note',
      content: 'This is the content of the second note.',
      version: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('Notes', null, {});
};