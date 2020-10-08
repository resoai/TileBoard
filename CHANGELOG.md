# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/resoai/TileBoard/compare/v1.0.4...v2.0.0) (2020-10-08)


### ⚠ BREAKING CHANGES

* This changes some behavior:
1. background of iframe tile is changed to ~~transparent~~ white, because otherwise, the background of the iframe would be awkwardly gray.
2. `iframeStyles` are applied to the iframe tile. Not to the `popup-container`. This is mainly due to the way, the popup is structured. There simply *is* a facility to pass styles to a tile. But there is *not* a facility to apply styles directly to the popup. For the user, this means that styles (e.g. borders) do not include the popup title anymore. 

* use modular popup for iframe popups ([#450](https://github.com/resoai/TileBoard/issues/450)) ([bc42eea](https://github.com/resoai/TileBoard/commit/bc42eea29c3d8bd630e34c6ff699e54f10d5022e))

### [1.0.4](https://github.com/resoai/TileBoard/compare/v1.0.3...v1.0.4) (2020-10-07)


### Bug Fixes

* camera title extending beyong tile boundaries ([#449](https://github.com/resoai/TileBoard/issues/449)) ([bd6c37d](https://github.com/resoai/TileBoard/commit/bd6c37dce25b7f449ad61522ab6124c306722165))

### [1.0.3](https://github.com/resoai/TileBoard/compare/v1.0.2...v1.0.3) (2020-09-28)
