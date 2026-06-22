# Stage 1: Build the Angular application
FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and zip utility
RUN apk add --no-cache zip && npm ci

ARG CACHE_BUST=1
# Copy the rest of the application code
COPY . .

# Build the application with production configuration
RUN npm run build

# Create build directory and zip the build output
RUN mkdir -p /build \
    && cd /app/dist/iep-blockexplorer-ui \
    && zip -r /build/iep-blockexplorer-ui.zip .

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS deploy

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist/iep-blockexplorer-ui /usr/share/nginx/html

# Copy the zip file to /build
COPY --from=build /build/iep-blockexplorer-ui.zip /build/iep-blockexplorer-ui.zip

# Copy custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# When the container starts, nginx will start automatically
CMD ["nginx", "-g", "daemon off;"]
