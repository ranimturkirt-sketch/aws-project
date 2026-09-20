# =============================================================================
# DevSecOps AWS — Task Manager — Makefile
# =============================================================================
# Usage: make <target>
# Run 'make help' for a list of available targets.

.PHONY: help init fmt validate plan apply destroy \
        build-backend build-frontend scan test \
        docker-build docker-scan clean

# Default environment
ENV ?= dev
AWS_REGION ?= eu-west-3
TF_DIR := terraform/environments/$(ENV)
BACKEND_DIR := backend
FRONTEND_DIR := frontend
DOCKER_IMAGE := taskmanager-backend
DOCKER_TAG := local

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m

help: ## Display this help message
	@echo ""
	@echo "$(GREEN)DevSecOps AWS — Task Manager$(NC)"
	@echo "============================================"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Environment:$(NC) $(ENV) (override with ENV=prod)"
	@echo ""

# =============================================================================
# Terraform
# =============================================================================

init: ## Initialize Terraform for the selected environment
	@echo "$(GREEN)► Initializing Terraform ($(ENV))...$(NC)"
	cd $(TF_DIR) && terraform init

fmt: ## Format Terraform files
	@echo "$(GREEN)► Formatting Terraform files...$(NC)"
	terraform fmt -recursive terraform/

fmt-check: ## Check Terraform formatting
	@echo "$(GREEN)► Checking Terraform format...$(NC)"
	terraform fmt -check -recursive terraform/

validate: init ## Validate Terraform configuration
	@echo "$(GREEN)► Validating Terraform ($(ENV))...$(NC)"
	cd $(TF_DIR) && terraform validate

plan: init ## Plan Terraform changes
	@echo "$(GREEN)► Planning Terraform ($(ENV))...$(NC)"
	cd $(TF_DIR) && terraform plan -out=tfplan

apply: ## Apply Terraform changes
	@echo "$(GREEN)► Applying Terraform ($(ENV))...$(NC)"
	cd $(TF_DIR) && terraform apply tfplan

destroy: ## Destroy Terraform infrastructure
	@echo "$(RED)► Destroying Terraform ($(ENV))...$(NC)"
	cd $(TF_DIR) && terraform destroy

# =============================================================================
# Bootstrap (Remote State)
# =============================================================================

bootstrap-init: ## Initialize Terraform bootstrap (remote state)
	@echo "$(GREEN)► Initializing bootstrap...$(NC)"
	cd terraform/bootstrap && terraform init

bootstrap-apply: bootstrap-init ## Create remote state resources
	@echo "$(GREEN)► Creating remote state resources...$(NC)"
	cd terraform/bootstrap && terraform apply

bootstrap-destroy: ## Destroy remote state resources
	@echo "$(RED)► Destroying remote state resources...$(NC)"
	cd terraform/bootstrap && terraform destroy

# =============================================================================
# Backend
# =============================================================================

install-backend: ## Install backend dependencies
	@echo "$(GREEN)► Installing backend dependencies...$(NC)"
	cd $(BACKEND_DIR) && npm ci

build-backend: install-backend ## Build backend TypeScript
	@echo "$(GREEN)► Building backend...$(NC)"
	cd $(BACKEND_DIR) && npm run build

test-backend: install-backend ## Run backend tests
	@echo "$(GREEN)► Running backend tests...$(NC)"
	cd $(BACKEND_DIR) && npm test

lint-backend: install-backend ## Lint backend code
	@echo "$(GREEN)► Linting backend...$(NC)"
	cd $(BACKEND_DIR) && npm run lint

# =============================================================================
# Frontend
# =============================================================================

install-frontend: ## Install frontend dependencies
	@echo "$(GREEN)► Installing frontend dependencies...$(NC)"
	cd $(FRONTEND_DIR) && npm ci

build-frontend: install-frontend ## Build frontend
	@echo "$(GREEN)► Building frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run build

test-frontend: install-frontend ## Run frontend tests
	@echo "$(GREEN)► Running frontend tests...$(NC)"
	cd $(FRONTEND_DIR) && npm test

lint-frontend: install-frontend ## Lint frontend code
	@echo "$(GREEN)► Linting frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run lint

# =============================================================================
# Docker
# =============================================================================

docker-build: ## Build Docker image for backend
	@echo "$(GREEN)► Building Docker image...$(NC)"
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) $(BACKEND_DIR)/

docker-scan: docker-build ## Scan Docker image with Trivy
	@echo "$(GREEN)► Scanning Docker image with Trivy...$(NC)"
	trivy image --severity HIGH,CRITICAL $(DOCKER_IMAGE):$(DOCKER_TAG)

docker-run: docker-build ## Run Docker image locally
	@echo "$(GREEN)► Running Docker container...$(NC)"
	docker run -p 3000:3000 \
		-e DB_HOST=localhost \
		-e DB_PORT=5432 \
		-e DB_NAME=appdb \
		-e DB_USERNAME=appadmin \
		-e DB_PASSWORD=localdev \
		-e NODE_ENV=development \
		$(DOCKER_IMAGE):$(DOCKER_TAG)

# =============================================================================
# Security Scanning
# =============================================================================

scan: scan-secrets scan-code scan-terraform scan-docker ## Run all security scans

scan-secrets: ## Scan for secrets with Gitleaks
	@echo "$(GREEN)► Scanning for secrets...$(NC)"
	gitleaks detect --source . --config .gitleaks.toml -v

scan-code: ## Scan code with Trivy
	@echo "$(GREEN)► Scanning code with Trivy...$(NC)"
	trivy fs --severity HIGH,CRITICAL --exit-code 1 .

scan-terraform: ## Scan Terraform with Trivy
	@echo "$(GREEN)► Scanning Terraform with Trivy...$(NC)"
	trivy config --severity HIGH,CRITICAL terraform/

scan-docker: docker-build ## Scan Docker image
	@echo "$(GREEN)► Scanning Docker image...$(NC)"
	trivy image --severity HIGH,CRITICAL --exit-code 1 $(DOCKER_IMAGE):$(DOCKER_TAG)

# =============================================================================
# All-in-one
# =============================================================================

test: test-backend test-frontend ## Run all tests

build: build-backend build-frontend ## Build everything

lint: lint-backend lint-frontend ## Lint everything

all: lint test build scan ## Lint, test, build, and scan everything

# =============================================================================
# Clean
# =============================================================================

clean: ## Clean build artifacts
	@echo "$(YELLOW)► Cleaning build artifacts...$(NC)"
	rm -rf $(BACKEND_DIR)/dist $(BACKEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/dist $(FRONTEND_DIR)/node_modules
	rm -f $(TF_DIR)/tfplan
	@echo "$(GREEN)✓ Clean complete$(NC)"
