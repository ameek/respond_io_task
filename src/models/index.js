// src/models/index.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize(dbConfig.development);

const modelDefiners = [];

// Read all model files
fs.readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    const model = import(`./${file}`);
    modelDefiners.push((model) => model(sequelize));
  });

// Import model definitions
for (const defineModel of modelDefiners) {
  defineModel();
}

// Associate models if needed
Object.keys(sequelize.models).forEach((modelName) => {
  if ('associate' in sequelize.models[modelName]) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

export { sequelize };
export default sequelize.models;