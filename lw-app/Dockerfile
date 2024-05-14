# STAGE 1: Build an App #
FROM node:latest AS build-source
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --force
COPY . .
RUN npm run build --prod
# STAGE 2: Run an App #
FROM nginx:latest
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-source /usr/src/app/dist/lw-app/browser /usr/share/nginx/html
# EXPOSE 80