import bcrypt from 'bcryptjs';

export const up = async (queryInterface) => {
  const hashedPassword1 = await bcrypt.hash('password1', 10);
  const hashedPassword2 = await bcrypt.hash('password2', 10);

  await queryInterface.bulkInsert('Users', [
    {
      email: 'user1@abc.com',
      password: hashedPassword1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      email: 'user2@abc.com',
      password: hashedPassword2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('Users', null, {});
};