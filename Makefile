# Everyday commands. All run inside Docker, so the only requirement is Docker Desktop.
# (With Node 22 installed you can use the npm scripts directly: npm run dev / post / build.)

.PHONY: dev post draft build preview shell install clean

dev:        ## Start the dev server at http://localhost:4321
	docker compose up

post:       ## Import Notion exports from inbox/ as posts
	docker compose run --rm --no-deps site npm run post

draft:      ## Import Notion exports from inbox/ as drafts
	docker compose run --rm --no-deps site npm run post -- --draft

build:      ## Production build into dist/
	docker compose run --rm --no-deps site npm run build

preview: build ## Build, then serve dist/ at http://localhost:4321 exactly as it will be deployed
	docker compose run --rm --no-deps --service-ports site npm run preview -- --host 0.0.0.0

install:    ## Rebuild the image after changing package.json
	docker compose build
	docker compose run --rm --no-deps site npm install

shell:      ## Open a shell in the container
	docker compose run --rm --no-deps site sh

clean:      ## Remove containers, the node_modules volume, and build output
	docker compose down -v
	rm -rf dist .astro
