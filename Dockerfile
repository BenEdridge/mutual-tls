FROM node:16-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm ci && npm run generate:keys-forge
CMD ["npm", "run", "start:server"]
USER node
EXPOSE 8443