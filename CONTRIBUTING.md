## Contributing

All contributions are welcome! If you would like to make some changes, follow these steps:

1. Fork the project and clone it.
2. Install `npm` dependencies:

```sh
npm i
```

3. Copy `config.example.js` to `dist-dev/config.js` and modify for your server.
4. Change `serverUrl` in the config to point to the Home Assistant URL.
5. Change `wsUrl` in the config to point to the Home Assistant API (use `wss` instead of `ws` protocol if HA is running on secure connection).
6. Start the development server:

```sh
npm run dev
```

This starts a local development server at address http://localhost:8080, serving the built TileBoard.

Modifications to the project trigger an automatic rebuild to make it easy to iterate quickly.

## Releases

Note: This is normally done by maintainers.

A new release can be created by running `npm version [patch|minor|major]` (choose `patch`, `minor` or `major` based on semver versioning rules). A new build of the app will be made in `dist` folder and new tagged commit will be created.
