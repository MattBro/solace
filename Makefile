.PHONY: help install-deps install-postgres setup-db start-postgres stop-postgres create-db migrate seed dev clean full-setup

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install-deps: ## Install Node.js dependencies
	npm install

install-postgres: ## Install PostgreSQL via Homebrew
	@echo "Installing PostgreSQL via Homebrew..."
	brew install postgresql@16
	@echo "PostgreSQL installed. Run 'make start-postgres' to start the service"

setup-db: start-postgres create-db migrate seed ## Complete database setup (start, create, migrate, seed)
	@echo "Database setup complete!"

start-postgres: ## Start PostgreSQL service
	@echo "Starting PostgreSQL service..."
	brew services start postgresql@16
	@sleep 2
	@echo "PostgreSQL service started"

stop-postgres: ## Stop PostgreSQL service
	@echo "Stopping PostgreSQL service..."
	brew services stop postgresql@16
	@echo "PostgreSQL service stopped"

create-db: ## Create solaceassignment database
	@echo "Creating database..."
	@createdb solaceassignment 2>/dev/null || echo "Database 'solaceassignment' already exists"
	@echo "Database ready"

migrate: ## Run database migrations
	@echo "Running migrations..."
	npx drizzle-kit push
	@echo "Migrations complete"

seed: ## Seed the database
	@echo "Seeding database..."
	@curl -X POST http://localhost:3000/api/seed || echo "Make sure the dev server is running (make dev)"
	@echo "Seeding complete"

dev: ## Start development server
	npm run dev

clean: ## Clean node_modules and reinstall
	rm -rf node_modules package-lock.json
	npm install

full-setup: install-deps install-postgres setup-db ## Complete project setup from scratch
	@echo "Full setup complete! Run 'make dev' to start the development server"

enable-db: ## Enable database in the application
	@echo "Enabling database connection..."
	@sed -i.bak 's/^#DATABASE_URL/DATABASE_URL/' .env
	@sed -i.bak 's|// const data = await|const data = await|' src/app/api/advocates/route.ts
	@sed -i.bak 's|const data = advocateData;|// const data = advocateData;|' src/app/api/advocates/route.ts
	@rm -f .env.bak src/app/api/advocates/route.ts.bak
	@echo "Database connection enabled. Restart the dev server to apply changes."

disable-db: ## Disable database and use mock data
	@echo "Disabling database connection..."
	@sed -i.bak 's/^DATABASE_URL/#DATABASE_URL/' .env
	@sed -i.bak 's|const data = await|// const data = await|' src/app/api/advocates/route.ts
	@sed -i.bak 's|// const data = advocateData;|const data = advocateData;|' src/app/api/advocates/route.ts
	@rm -f .env.bak src/app/api/advocates/route.ts.bak
	@echo "Database connection disabled. Using mock data. Restart the dev server to apply changes."