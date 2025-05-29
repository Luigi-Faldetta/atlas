# Backend API Service Dockerfile
# This containerizes the Node.js Express API with Prisma ORM

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (bcryptjs doesn't require native compilation)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=development
ENV PORT=5000

# Start the application
CMD ["npm", "start"] 