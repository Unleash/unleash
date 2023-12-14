## Use UNLEASH_DOCKER_IMAGE to override the docker image used for testing
## Examples:
## - UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:latest
## - UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:4.12.6
## - UNLEASH_DOCKER_IMAGE=ghcr.io/ivarconr/unleash-enterprise:latests
## - UNLEASH_DOCKER_IMAGE=ghcr.io/ivarconr/unleash-enterprise:5.6.0
ifndef UNLEASH_DOCKER_IMAGE
override UNLEASH_DOCKER_IMAGE = unleashorg/unleash-server:latest
endif

ifndef EXPOSED_PORT
override EXPOSED_PORT = 4242
endif

# default action
.PHONY: default
default:
	@echo "Usage: make [command]"
	@echo ""
	@echo "This helps testing the impact of latest migrations into an old version of Unleash, helping us answer the following questions:"
	@echo "  - Can we safely upgrade to the latest version from version X?"
	@echo "  - If we need to rollback to the previous version, can we do that?"
	@echo ""
	@echo "Environment variables:"
	@echo "  - UNLEASH_DOCKER_IMAGE: docker image used for start-docker command"
	@echo "  - EXPOSED_PORT: port used for start-docker command where unleash will be exposed"
	@echo ""
	@echo "The most common way of using this makefile is to run 'make tests' followed by manual exploration of Unleash at http://localhost:4242"
	@echo ""
	@echo "You can also explore the current version running 'make run-current' and exploring the new version at http://localhost:3000"
	@echo ""
	@echo "Example:"
	@echo "    - UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:5.6.0 make tests"
	@echo ""
	@echo "If you just want to test one version and then another one you can simply run these two commands one after the other:"
	@echo "  UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:4.12.6 make start-docker"
	@echo "  EXPOSED_PORT=4243 UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:5.6.10 make start-docker"
	@echo "The old version will run on http://localhost:4242 and the new one on http://localhost:4243"
	@echo ""
	@echo "Commands available (you can manually run them one by one in this specific order):"
	@echo "  1. clean: clean up before or after the tests"
	@echo "  2. start-docker: Start docker with the previous version specified by UNLEASH_DOCKER_IMAGE"
	@echo "  3. apply-migrations: Apply migrations from HEAD"
	@echo "  4. prepare: Install dependencies to run the tests"
	@echo "  5. tests: Applies all the steps above and then run UI tests"
	@echo "  6. run-current: Run the current version of unleash from this local repository"

.PHONY: prepare
prepare: 
	@echo "Preparing the environment..."
	@yarn --cwd .. install --frozen-lockfile --ignore-scripts


.PHONY: apply-migrations
apply-migrations: prepare start-docker
	@echo "Applying migrations from HEAD... $(git rev-parse HEAD)"
	@DATABASE_URL=postgres://postgres:unleash@localhost:5432/unleash DATABASE_SSL=false yarn --cwd .. db-migrate up

.PHONY: run-current
run-current: prepare start-docker
	@yarn install --cwd ../frontend
	@yarn build --cwd ../frontend
	@HTTP_PORT=4243 UNLEASH_API=http://localhost:4243 DATABASE_URL=postgres://postgres:unleash@localhost:5432/unleash DATABASE_SSL=false yarn --cwd .. dev
	@echo "You can manually validate current unleash at http://localhost:3000 and compare with previous version at http://localhost:4242"

.PHONY: tests
tests: clean apply-migrations
	@echo "Running tests..."
	@yarn --cwd ../frontend e2e:oss
	@echo "You can manually validate unleash at http://localhost:4242"
	@echo "If you want to test the current version (HEAD of this git repo) side-by-side, execute make run-current"
	@echo "After all, you clean up by running 'make clean'"

.PHONY: start-docker
start-docker:
	@echo "Starting docker..."
	@UNLEASH_DOCKER_IMAGE=$(UNLEASH_DOCKER_IMAGE) docker compose up -d
	@echo "Waiting for Unleash to be healthy..."
	@while ! curl -s "http://localhost:$(EXPOSED_PORT)/health"; do sleep 0.1; done
	@echo "\n$(UNLEASH_DOCKER_IMAGE) is now running at http://localhost:$(EXPOSED_PORT)"

.PHONY: clean
clean:
	@echo "Cleaning up docker..."
	@docker compose stop && docker compose rm -f