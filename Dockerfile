# Use official Node.js 18 image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production)
RUN npm install --only=production

# Copy all project files
COPY . .

# Expose port (adjust if your app uses another)
EXPOSE 8000

# Start the app
CMD ["node", "src/index.js"]
