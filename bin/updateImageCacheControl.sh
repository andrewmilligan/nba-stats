#!/bin/bash

IMAGE_CACHE_CONTROL="max-age=86400"

BUCKET="basketball-stats-data"
TEAM_LOGO_PREFIX="images/teams/logos"
PLAYER_HEADSHOT_PREFIX="images/players/headshots/latest"

CLOUDFRONT_DISTRIBUTION="E3VYHWQGUHITE2"

TEAMS=(
  $(
    aws s3 ls \
      --profile personal \
      "${BUCKET}/${TEAM_LOGO_PREFIX}/" \
    | sed 's/.*PRE //' \
    | sed 's/\/$//'
  )
)
PLAYERS=(
  $(
    aws s3 ls \
      --profile personal \
      "${BUCKET}/${PLAYER_HEADSHOT_PREFIX}/large/" \
    | sed 's/.* //' \
    | sed 's/\.png$//'
  )
)

TEAM_LOGO_VARIANTS=( "primary/D" "primary/L" )
PLAYER_HEADSHOT_VARIANTS=( large small )

function UPDATE_CACHE_CONTROL {
  KEY="$1"
  CACHE_CONTROL="$2"
  CONTENT_TYPE="$3"
  echo "+ Updating ${KEY} with cache-control: ${CACHE_CONTROL}"
  aws s3 cp \
    --profile personal \
    --cache-control "${CACHE_CONTROL}" \
    --content-type "${CONTENT_TYPE}" \
    --metadata-directive REPLACE \
    "${KEY}" \
    "${KEY}"
}

PURGE_PATHS=()
for TEAM in "${TEAMS[@]}"; do
  for VARIANT in "${TEAM_LOGO_VARIANTS[@]}"; do
    KEY="${TEAM_LOGO_PREFIX}/${TEAM}/${VARIANT}/logo.svg"
    S3_KEY="s3://${BUCKET}/${KEY}"
    UPDATE_CACHE_CONTROL "$S3_KEY" "$IMAGE_CACHE_CONTROL" "image/svg+xml"
    PURGE_PATHS+=( "$KEY" )
  done
done

for PLAYER in "${PLAYERS[@]}"; do
  for VARIANT in "${PLAYER_HEADSHOT_VARIANTS[@]}"; do
    KEY="${PLAYER_HEADSHOT_PREFIX}/${VARIANT}/${PLAYER}.png"
    S3_KEY="s3://${BUCKET}/${KEY}"
    UPDATE_CACHE_CONTROL "$S3_KEY" "$IMAGE_CACHE_CONTROL" "image/png"
    PURGE_PATHS+=( "$KEY" )
  done
done

echo "+ Clearing cache on ${#PURGE_PATHS[@]} files"
CF_STATUS=$( aws cloudfront \
  --profile personal \
  create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION" \
  --paths "${PURGE_PATHS[@]}"
)
