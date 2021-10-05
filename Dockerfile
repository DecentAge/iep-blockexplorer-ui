# build environment
FROM node:12-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
RUN apk add --no-cache zip
RUN npm install -g gulp@4.0.2
RUN npm link gulp --force
COPY ["package*.json", "gulpfile.js", ".jshintrc", "default.conf.template", "30-nginx-iep-startup-script.sh", "./"]
RUN npm install
COPY ["bower.json", "./"]
RUN npm run bower install
COPY /app /app/app
RUN npm run-script update-version --release_version=$(cat release-version.txt)
RUN npm run build
RUN mkdir -p /app/build
RUN zip -r /app/build/iep-blockexplorer-ui.zip ./dist

# production environment
FROM nginx:1.18-alpine
ENV NGINX_PATH=/
COPY --from=builder /app/dist /usr/share/nginx/html/
COPY --from=builder /app/build /build
COPY --from=builder /app/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/app/env.config.js.template /etc/nginx/templates/env.config.js.template
COPY --from=builder /app/30-nginx-iep-startup-script.sh /docker-entrypoint.d/30-nginx-iep-startup-script.sh
RUN chmod ugo+x /docker-entrypoint.d/30-nginx-iep-startup-script.sh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]