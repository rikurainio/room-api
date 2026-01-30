```sh
# Install packages
npm install

# Development
npm run dev
npm run dev:docker #run development in docker container

# Tests
npm test

# Build
npm run build
npm run build:image #build docker image

# Linting and Formatting
npm run lint
npm run lint:fix
npm run format
```

Dev helpers
- bruno_queries contains queries for easy testing the api with a client called [Bruno](https://www.usebruno.com)
- biome.json contains linting and formatting configuration