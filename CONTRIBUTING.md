# Contributing to TileBoard

All contributions are welcome! If you would like to make some changes, follow these steps:

1. Fork the project and clone it.
2. Install project dependencies:

Note: You might need to install `yarn` globally first with `npm i -g yarn` or by follow instructions at https://classic.yarnpkg.com/en/docs/install.

```sh
yarn
```

3. Copy `config.example.js` to `build/config.js` (create `build` directory if necessary) and adjust options for your server:
 - Change `serverUrl` in the config to point to the Home Assistant URL.
 - Change `wsUrl` in the config to point to the Home Assistant API (use `wss` instead of `ws` protocol if HA is running on secure connection).
4. Configure `http.cors_allowed_origins` setting in Home Assistant to allow your server (e.g. localhost) to communicate with the HA API:

```yaml
http:
  cors_allowed_origins:
    - http://<your-server>:8080
```

This needs to be added in `configuration.yaml` in HA. See https://www.home-assistant.io/integrations/http/#cors_allowed_origins for more info.

5. Start the development server:

```sh
yarn dev
```

This starts a local development server at address http://localhost:8080, serving the built TileBoard.

Modifications to the project trigger an automatic rebuild to make it easy to iterate quickly.

## Production build

To create an optimized release build of TileBoard run:

```sh
yarn build
```

This creates optimized, smaller build that should be used when running TileBoard in "production". This command doesn't start development server.

Release builds are also attached to GitHub releases in "assets" section so if you are not planning to make any changes then you can use those instead.

## Releases (only for maintainers)

A new release can be created by running `yarn release`. A new tagged commit will be created and pushed to the remote repo, triggering automatic creation of new release with built app package attached in "assets" section.
