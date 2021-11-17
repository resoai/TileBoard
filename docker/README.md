# Running with Docker

1. Download the [sample
config](https://raw.githubusercontent.com/resoai/TileBoard/master/config.example.js)
file to `config.js` and edit it.

   ```sh
   wget -O config.js https://raw.githubusercontent.com/resoai/TileBoard/master/config.example.js
   vim config.js
   ```

2. Copy the following to `docker-compose.yml`:

   ```yaml
   version: '2'
   services:
     tileboard:
       image: tileboard/tileboard:latest
       restart: unless-stopped
       port:
         - 9000:80
       volumes:
         - ./config.js:/usr/share/nginx/html/config.js
   ```

3. Run with `docker-compose up --detach`
4. Access at http://localhost:9000

## Building

```sh
docker build -t tileboard/tileboard -f docker/Dockerfile .
```

Multi-platform:

```sh
rm -rf ./build/
docker buildx build -t tileboard/tileboard:build -f docker/Dockerfile.build --output build .
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6 \
  --pull \
  -t tileboard/tileboard:latest \
  -f docker/Dockerfile.run \
  --push \
  .
```
