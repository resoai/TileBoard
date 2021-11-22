FROM node:16 AS builder

RUN mkdir -p /build
WORKDIR /build

COPY ./package.json yarn.lock /build/

RUN yarn install

COPY ./ /build

RUN yarn run build


# Runtime image
FROM nginx:alpine AS runtime

COPY ./docker/00-check-config.sh /docker-entrypoint.d/
COPY --from=builder /build/build /usr/share/nginx/html

RUN touch /usr/share/nginx/html/styles/custom.css
