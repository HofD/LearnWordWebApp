# STAGE 1: Build an App #
FROM node:20-alpine AS build-source
WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci --force
COPY . .
ARG ANGULAR_CONFIGURATION=production
RUN npm run build -- --configuration ${ANGULAR_CONFIGURATION}
# STAGE 2: Run an App #
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-source /usr/src/app/dist/lw-app/browser /usr/share/nginx/html
# EXPOSE 80
