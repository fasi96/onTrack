# Use Node.js LTS version as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install global packages
RUN npm install -g vite@latest

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 5173 (Vite's default port)
EXPOSE 5173

# Start the development server with the host flag
CMD ["npm", "run", "dev", "--", "--host"] 