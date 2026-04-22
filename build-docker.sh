#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

RELEASE_VERSION=$(cat release-version.txt)
docker build -t decentage/iep-blockexplorer:${RELEASE_VERSION} .

docker rm --force iep-blockexplorer-extract 2>/dev/null

CONTAINER_ID=$(docker create --rm --name iep-blockexplorer-extract decentage/iep-blockexplorer:${RELEASE_VERSION})
mkdir -p ./build

# Copy the compiled package from the container to the host
docker cp ${CONTAINER_ID}:/build/iep-blockexplorer.zip ./build

docker rm iep-blockexplorer-extract
