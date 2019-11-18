FROM node:buster-slim
WORKDIR /usr/src/app
COPY . .
RUN npm ci
CMD ["npm", "run", "start:server"]
USER node
EXPOSE 8443