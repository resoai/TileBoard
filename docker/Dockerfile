FROM node:latest AS builder

RUN mkdir -p /build
WORKDIR /build

COPY ./package.json yarn.lock /build/

RUN yarn install

COPY ./ /build

RUN yarn run build


# Runtime image
FROM nginx:alpine

COPY ./docker/00-check-config.sh /docker-entrypoint.d/
COPY --from=builder /build/build /usr/share/nginx/html
