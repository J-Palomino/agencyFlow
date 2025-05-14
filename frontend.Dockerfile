# Frontend Dockerfile for Vite/React Dev
FROM node:20-alpine as deps

WORKDIR /app

# First copy only package files
COPY package*.json ./

# Install dependencies
RUN npm cache clean --force && \
    npm install

# Development stage
FROM node:20-alpine
WORKDIR /app

# Copy from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173

# Run the development server
CMD ["npm", "run", "dev", "--", "--host"]
