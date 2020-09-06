## Contributing

All contributions are welcome! If you would like to make some changes, follow these steps:

- Fork the project and clone it.
- Copy `config.example.js` to `dist/config.js` and modify for your server.
- Run those commands:

```sh
npm i
npm run dev dev
```

This starts a local development server at address http://localhost:8080 serving built app.

Modifications to the project trigger an automatic rebuild to make it easy to iterate fast.

## Releases

Note: This is normally done by maintainers.

A new release can be created by running `npm version [patch|minor|major]` (choose `patch`, `minor` or `major` based on semver versioning rules). A new build of the app will be made in `dist` folder and new tagged commit will be created.
