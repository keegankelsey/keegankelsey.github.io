# Portable dev/build environment. The same Node version is used in CI (see .nvmrc).
FROM node:22-alpine

WORKDIR /site

# Install dependencies first so they're cached between source changes.
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
