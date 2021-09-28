# Release 0.3.3

# Release 0.3.2
- added network to website title (mainnet/testnet)
- fixed displayed target value in block list
- added difficulty to block list
- disabled panels to avoid toggling of boxes
- fixed link to peerexplorer
- adjusted font color for better readability
- formatted dates with locale detection


# Release 0.3.1
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
