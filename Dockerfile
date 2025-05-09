# Stage 1: Build
FROM node:22-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Stage 2: Production
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy only necessary files from the build stage
COPY --from=build /usr/src/app .

# Set environment to production
ENV NODE_ENV=development

# Install only production dependencies
# RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "run", "dev"]