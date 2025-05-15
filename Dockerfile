FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the client application
RUN npm run build --prefix client

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]