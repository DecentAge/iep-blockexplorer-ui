#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

RELEASE_VERSION=$(cat release-version.txt)
docker build -t decentage/iep-blockexplorer-ui:${RELEASE_VERSION}  .

CONTAINER_ID=$(docker create --rm --name iep-blockexplorer-ui-extract decentage/iep-blockexplorer-ui:${RELEASE_VERSION})
mkdir -p ./build
docker cp ${CONTAINER_ID}:/build/iep-blockexplorer-ui.zip ./build
docker rm ${CONTAINER_ID}