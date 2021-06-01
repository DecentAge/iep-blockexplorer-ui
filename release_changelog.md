** Release 0.3.0 **
- moved base app folder to root
- added jshont rc in order to be able to compile the project
- Dockerized the project
- added build docker file
- upgrade dependencies and adjust gulp file
- changed image name to decentage/XXXX:latest
- dependabot config
- add package-lock to gitignore
- adjust browsersync to take port and public path from process env
- using nginx template mechanism now. added .dockerignore file
- removed node_env variable used for npm build
- added default value for NGINX_PATH and remove trailing slash in nginx config template
- relative bower paths
- env.config.js.template and subenv for dev mode