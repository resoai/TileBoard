ARG BUILD_FROM=hassioaddons/base:8.0.5
FROM ${BUILD_FROM}

# Build arguments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_REF
ARG BUILD_VERSION

ENV LANG C.UTF-8

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Setup base
RUN apk add --no-cache nginx curl unzip \
        && curl -L https://github.com/resoai/TileBoard/releases/download/v${BUILD_VERSION}/TileBoard.zip > /tmp/tileboard.zip \
        && unzip /tmp/tileboard.zip -d /var/www/tileboard \
        && rm /tmp/tileboard.zip \
        && rm -rf /var/www/tileboard/images \
        && apk del --no-cache --purge curl unzip

# Copy root filesystem
COPY rootfs /

# Labels
LABEL \
    io.hass.name="TileBoard" \
    io.hass.description="Home Assistant Tile Board addon" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="anthony2856" \
    org.label-schema.description="Home Assistant Tile Board addon" \
    org.label-schema.build-date=${BUILD_DATE} \
    org.label-schema.name="TileBoard" \
    org.label-schema.schema-version=${BUILD_VERSION} \
    org.label-schema.url="https://github.com/resoai/TileBoard" \
    org.label-schema.usage="https://github.com/resoai/TileBoard/README.md" \
    org.label-schema.vcs-ref=${BUILD_REF} \
    org.label-schema.vcs-url="https://github.com/resoai/TileBoard" \
    org.label-schema.vendor="TileBoard Addons"