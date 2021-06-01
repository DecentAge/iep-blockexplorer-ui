#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

RELEASE_VERSION=$(cat release-version.txt)
docker build -t decentage/iep-blockexplorer-ui:${RELEASE_VERSION}  .

echo "Creating fake zip file to avoid artifact upload issue"
mkdir -p ./build
docker cp ${CONTAINER_ID}:/build/iep-blockexplorer-ui.zip ./build
docker rm ${CONTAINER_ID}