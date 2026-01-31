# Use Node.js 20 Alpine for minimal size
FROM node:20-alpine

# Create a non-root user and its home directory
# This avoids permission issues and is a security best practice
RUN adduser -D -s /bin/sh next && \
    mkdir -p /home/next/app && \
    chown -R next:next /home/next/app

# Set the working directory
WORKDIR /home/next/app

# Copy package files first (better layer caching)
# Change ownership to next user
COPY --chown=next:next package*.json ./

# Install dependencies as root (for write permissions)
RUN npm install

# Switch to the non-root user for running the app
USER next

# Expose the dev server port
EXPOSE 3000

# Start the development server with hot reload
CMD ["npm", "run", "dev"]