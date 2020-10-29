# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.3](https://github.com/resoai/TileBoard/compare/v2.0.2...v2.0.3) (2020-10-29)


### Bug Fixes

* app not installable on firefox ([#495](https://github.com/resoai/TileBoard/issues/495)) ([0bd4710](https://github.com/resoai/TileBoard/commit/0bd471004840cad750c268acaec4013ef182ef13))

### [2.0.2](https://github.com/resoai/TileBoard/compare/v2.0.1...v2.0.2) (2020-10-21)


### Bug Fixes

* sliders to allow zero values ([#493](https://github.com/resoai/TileBoard/issues/493)) ([232204e](https://github.com/resoai/TileBoard/commit/232204e4700d3decacabc4214682daf902900b03))
* **LIGHT:** show color picker based on feature check ([#488](https://github.com/resoai/TileBoard/issues/488)) ([9f55a3d](https://github.com/resoai/TileBoard/commit/9f55a3d748f33806919b37f94b0d81a5cb56539f))
* don't cache icon background ([#471](https://github.com/resoai/TileBoard/issues/471)) ([f9ea1ef](https://github.com/resoai/TileBoard/commit/f9ea1efbdb2f06bf02847266cc3ab1d07ac22a9d)), closes [#425](https://github.com/resoai/TileBoard/issues/425)
* enable arm buttons based on supported alarm features ([9d829c1](https://github.com/resoai/TileBoard/commit/9d829c179c24e186ba9ff1921b7f44564d27838a)), closes [#365](https://github.com/resoai/TileBoard/issues/365)
* enable arm buttons based on supported alarm features ([#473](https://github.com/resoai/TileBoard/issues/473)) ([31d5a5a](https://github.com/resoai/TileBoard/commit/31d5a5ae6440ef2ccac6d3c977133216fef3e9cd)), closes [#365](https://github.com/resoai/TileBoard/issues/365)
* long-press closes popups and light sliders immediately ([#489](https://github.com/resoai/TileBoard/issues/489)) ([492895b](https://github.com/resoai/TileBoard/commit/492895bf7e0942ab20cb880db40e38b84f8a0a25))
* update alarm tile example with support for new states ([#472](https://github.com/resoai/TileBoard/issues/472)) ([43f151b](https://github.com/resoai/TileBoard/commit/43f151b4aeebc8e93e27880ed161f98e787d99fe))

### [2.0.1](https://github.com/resoai/TileBoard/compare/v2.0.0...v2.0.1) (2020-10-12)


### Bug Fixes

* bundle with mdi fonts instead of loading from external server ([#468](https://github.com/resoai/TileBoard/issues/468)) ([51bfd3b](https://github.com/resoai/TileBoard/commit/51bfd3befa3682c8ac19bcfafe704739bea1e1c5)), closes [#453](https://github.com/resoai/TileBoard/issues/453)
* camera full screen opening when clicking door entry camera ([#463](https://github.com/resoai/TileBoard/issues/463)) ([18f232a](https://github.com/resoai/TileBoard/commit/18f232ade9585b3bd98a119e4b5da89a79523c88))

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
