import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: "./src/.env" });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DIALECT || "mysql",
    logging: false,
  }
);

export default sequelize;

// Uncomment the following lines if you want to use dotenv for environment variables
// import dotenv from 'dotenv';
// dotenv.config();

// const dbConfig = {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: process.env.DIALECT || 'mysql',
//     logging: false,
//   },
//   test: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: `${process.env.DB_NAME}_test`,
//     host: process.env.DB_HOST,
//     dialect: process.env.DIALECT || 'mysql',
//     logging: false,
//   },
//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: process.env.DIALECT || 'mysql',
//     logging: false,
//   },
// };

// export default dbConfig;
