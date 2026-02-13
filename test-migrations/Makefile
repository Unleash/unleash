## Use UNLEASH_DOCKER_IMAGE to override the docker image used for testing
## Examples:
## - UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:latest
## - UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:4.12.6
## - UNLEASH_DOCKER_IMAGE=ghcr.io/ivarconr/unleash-enterprise:latest
## - UNLEASH_DOCKER_IMAGE=ghcr.io/ivarconr/unleash-enterprise:5.6.0
ifndef UNLEASH_DOCKER_IMAGE
override UNLEASH_DOCKER_IMAGE = unleashorg/unleash-server:latest
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
	@echo "  - UNLEASH_DOCKER_IMAGE: docker image used for start-unleash command"
	@echo "  - EXPOSED_PORT: port used for start-unleash command where Unleash will be exposed. Also specifies which port will be used for the UI tests"
	@echo ""
	@echo "The most common way of using this makefile is to run 'make start-unleash test' followed by manual exploration of Unleash at http://localhost:4242"
	@echo ""
	@echo "You can also explore the current version running 'make run-current' and exploring the new version at http://localhost:3000"
	@echo ""
	@echo "Example:"
	@echo "    - UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:5.6.0 make start-unleash test"
	@echo ""
	@echo "If you just want to test one version and then another one you can simply run these two commands one after the other:"
	@echo "  UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:4.12.6 make start-unleash"
	@echo "  UNLEASH_DOCKER_IMAGE=unleashorg/unleash-server:5.6.10 make start-another-unleash"
	@echo "The old version will run on http://localhost:4242 and the new one on http://localhost:4242"
	@echo ""
	@echo "Commands available (you can manually run them one by one in this specific order):"
	@echo "  1. clean: clean up before or after the test"
	@echo "  2. start-unleash: Start docker with the previous version specified by UNLEASH_DOCKER_IMAGE"
	@echo "  3. start-another-unleash: same as above, but runs another instance side by side"
	@echo "  4. apply-migrations: Apply migrations from HEAD"
	@echo "  5. prepare: Install dependencies to run the test"
	@echo "  6. test: Run UI tests (you can specify EXPOSED_PORT to run the tests against a different port)"
	@echo "  7. run-current: Run the current version of Unleash from this local repository"
	@echo "  8. start-another-unleash: Starts another docker instance of Unleash with the image specified by UNLEASH_DOCKER_IMAGE"

.PHONY: prepare
prepare: 
	@echo "Preparing the environment..."
	@yarn --cwd .. install --frozen-lockfile 


.PHONY: apply-migrations
apply-migrations: prepare
	@echo "Applying migrations from HEAD... $(git rev-parse HEAD)"
	@DATABASE_URL=postgres://postgres:unleash@localhost:5432/unleash DATABASE_SSL=false yarn --cwd .. db-migrate up


.PHONY: run-current-ui
run-current-ui: prepare
	@yarn install --cwd ../frontend
	@UNLEASH_API=http://localhost:$${EXPOSED_PORT:-4244} DATABASE_URL=postgres://postgres:unleash@localhost:5432/unleash DATABASE_SSL=false yarn --cwd ../frontend dev
	@echo "You can manually validate current Unleash at http://localhost:3000 and compare with previous version"

.PHONY: run-current
run-current: prepare start-db
	@HTTP_PORT=$($${EXPOSED_PORT:-4244}) DATABASE_URL=postgres://postgres:unleash@localhost:5432/unleash DATABASE_SSL=false yarn --cwd .. dev:backend
	@echo "You can manually validate current Unleash at http://localhost:$${EXPOSED_PORT:-4244} and compare with previous version"
	@echo "Waiting for Unleash to be healthy at port $${EXPOSED_PORT:-4244}..."
	@while ! curl -s "http://localhost:$${EXPOSED_PORT:-4244}/health"; do sleep 0.1; done
	@echo "\nUnleash is now running at http://localhost:$${EXPOSED_PORT:-4244}"

.PHONY: test
test:
	@echo "Running tests against $${EXPOSED_PORT:-4242}..."
	@EXPOSED_PORT=$${EXPOSED_PORT:-4242} yarn --cwd ../frontend e2e:oss
	@echo "You can manually validate Unleash at http://localhost:$${EXPOSED_PORT:-4242}"
	@echo "If you want to test the current version (HEAD of this git repo) side-by-side, execute make run-current"
	@echo "After all, you clean up by running 'make clean'"

.PHONY: start-unleash
start-unleash:
	@echo "Starting docker..."
	@UNLEASH_DOCKER_IMAGE=$(UNLEASH_DOCKER_IMAGE) docker compose up unleash -d
	@echo "Waiting for Unleash to be healthy at port $${EXPOSED_PORT:-4242}..."
	@while ! curl -s "http://localhost:$${EXPOSED_PORT:-4242}/health"; do sleep 0.1; done
	@echo "\n$(UNLEASH_DOCKER_IMAGE) is now running at http://localhost:$${EXPOSED_PORT:-4242}"

.PHONY: start-another-unleash
start-another-unleash:
	@echo "Starting docker..."
	@EXPOSED_PORT=$${EXPOSED_PORT:-4242} UNLEASH_DOCKER_IMAGE=$(UNLEASH_DOCKER_IMAGE) docker compose up db another-unleash -d
	@echo "Waiting for Unleash to be healthy at port $${EXPOSED_PORT:-4242}..."
	@while ! curl -s "http://localhost:$${EXPOSED_PORT:-4242}/health"; do sleep 0.1; done
	@echo "\n$(UNLEASH_DOCKER_IMAGE) is now running at http://localhost:$${EXPOSED_PORT:-4242}"

.PHONY: start-db
start-db:
	@echo "Starting docker..."
	@docker compose up db -d
	@echo "Waiting for DB to be healthy..."
	@sleep 3
	@echo "\nDone waiting for DB to be healthy..."

.PHONY: clean
clean:
	@echo "Cleaning up docker..."
	@docker compose stop && docker compose rm -f