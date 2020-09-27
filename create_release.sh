set -e

npm ci
npm run build
cp config.example.js dist
pushd dist
zip -qr "../TileBoard.zip" .
