# Project Atlas - Docker Management Makefile
# Simplifies Docker operations for 2-developer team

.PHONY: help dev-start dev-stop build deploy test clean logs status

# Default target
help:
	@echo "Project Atlas Docker Commands:"
	@echo "  make dev-start    - Start development environment"
	@echo "  make dev-stop     - Stop development environment"
	@echo "  make build        - Build all Docker images"
	@echo "  make deploy       - Deploy to production (Mac Mini)"
	@echo "  make test         - Run all tests"
	@echo "  make clean        - Clean up Docker resources"
	@echo "  make logs         - Show logs from all services"
	@echo "  make status       - Show status of all services"

# Start development environment
dev-start:
	@echo "🚀 Starting Project Atlas development environment..."
	docker-compose up -d
	@echo "✅ All services started!"
	@echo "📱 Frontend: http://localhost:3000 (run separately with 'cd frontend && npm run dev')"
	@echo "🔧 Backend API: http://localhost:5000"
	@echo "🤖 AI Agent: http://localhost:8000"
	@echo "🎛️  MCP Server: http://localhost:3001"
	@echo "🔄 Express Proxy: http://localhost:5001"
	@echo "🗄️  PostgreSQL: localhost:5432"

# Stop development environment
dev-stop:
	@echo "🛑 Stopping Project Atlas development environment..."
	docker-compose down
	@echo "✅ All services stopped!"

# Build all images
build:
	@echo "🔨 Building all Docker images..."
	docker-compose build --no-cache
	@echo "✅ All images built!"

# Deploy to production (Mac Mini)
deploy:
	@echo "🚀 Deploying to production..."
	git push origin main
	@echo "✅ Deployment triggered via GitHub Actions!"
	@echo "📊 Check deployment status at: https://github.com/your-repo/actions"

# Run tests
test:
	@echo "🧪 Running all tests..."
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit
	docker-compose -f docker-compose.test.yml down
	@echo "✅ Tests completed!"

# Clean up Docker resources
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -af
	docker volume prune -f
	@echo "✅ Cleanup completed!"

# Show logs from all services
logs:
	@echo "📋 Showing logs from all services..."
	docker-compose logs -f

# Show status of all services
status:
	@echo "📊 Service Status:"
	@docker-compose ps
	@echo ""
	@echo "🐳 Docker System Info:"
	@docker system df

# Quick restart of a specific service
restart-backend:
	docker-compose restart backend

restart-ai-agent:
	docker-compose restart ai-agent

restart-mcp:
	docker-compose restart mcp-server

restart-proxy:
	docker-compose restart express-proxy

# Database operations
db-migrate:
	@echo "🗄️  Running database migrations..."
	docker-compose exec backend npx prisma migrate deploy

db-seed:
	@echo "🌱 Seeding database..."
	docker-compose exec backend npx prisma db seed

db-reset:
	@echo "⚠️  Resetting database..."
	docker-compose exec backend npx prisma migrate reset --force

# Development helpers
shell-backend:
	docker-compose exec backend sh

shell-ai-agent:
	docker-compose exec ai-agent bash

shell-postgres:
	docker-compose exec postgres psql -U atlas_user -d atlas

# Health checks
health:
	@echo "🏥 Checking service health..."
	@curl -f http://localhost:5000/health && echo "✅ Backend healthy" || echo "❌ Backend unhealthy"
	@curl -f http://localhost:8000/health && echo "✅ AI Agent healthy" || echo "❌ AI Agent unhealthy"
	@curl -f http://localhost:3001/health && echo "✅ MCP Server healthy" || echo "❌ MCP Server unhealthy"
	@curl -f http://localhost:5001/health && echo "✅ Express Proxy healthy" || echo "❌ Express Proxy unhealthy" 