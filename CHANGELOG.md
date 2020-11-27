# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.1](https://github.com/resoai/TileBoard/compare/v2.1.0...v2.1.1) (2020-11-27)


### Bug Fixes

* merge default tile values correctly ([#551](https://github.com/resoai/TileBoard/issues/551)) ([6a814f2](https://github.com/resoai/TileBoard/commit/6a814f208714fc41733441eda25b99671f649a86))
* **CAMERA_STREAM:** pause stream when screensaver active or page changed ([#544](https://github.com/resoai/TileBoard/issues/544)) ([3ba99d1](https://github.com/resoai/TileBoard/commit/3ba99d198d53529f97bfd3a71ac8802048af5fc8)), closes [#541](https://github.com/resoai/TileBoard/issues/541)
* **CAMERA_STREAM:** support non-HLS-capable devices ([#537](https://github.com/resoai/TileBoard/issues/537)) ([7bbeb3c](https://github.com/resoai/TileBoard/commit/7bbeb3ca9aa983d35271b7566d9f4a5530cd271d))
* **CAMERA_THUMBNAIL:** remove deprecated CAMERA_THUMBNAIL tile ([#548](https://github.com/resoai/TileBoard/issues/548)) ([0b0a101](https://github.com/resoai/TileBoard/commit/0b0a101864b735e9958acd582a4691eca97f62b1))
* **docs:** clearer instructions in the fallback index.html ([8eaa551](https://github.com/resoai/TileBoard/commit/8eaa551ba2525fe9d392c2e0afcef844859d6548))

## [2.1.0](https://github.com/resoai/TileBoard/compare/v2.0.3...v2.1.0) (2020-11-22)


### Features

* allow item.classes to be a function ([#527](https://github.com/resoai/TileBoard/issues/527)) ([813f315](https://github.com/resoai/TileBoard/commit/813f31586d5fc9007873c70423219c98381f114e))
* support config file selection using a "config" query ([#530](https://github.com/resoai/TileBoard/issues/530)) ([711e2b8](https://github.com/resoai/TileBoard/commit/711e2b8fd9ccc286c55807156c790a2ecf573b0c))
* use moment.js for timeAgo ([#521](https://github.com/resoai/TileBoard/issues/521)) ([5227be4](https://github.com/resoai/TileBoard/commit/5227be46955f57b157b0003ae17d2977bce1ccd1))


### Bug Fixes

* **popup:** popup timeout now accessible to user on $scope ([#535](https://github.com/resoai/TileBoard/issues/535)) ([6e73deb](https://github.com/resoai/TileBoard/commit/6e73deb6c9f37065c07e1baac287e43428fcc9f3))
* improve handling of merging defaults for popup tiles ([#519](https://github.com/resoai/TileBoard/issues/519)) ([250ac64](https://github.com/resoai/TileBoard/commit/250ac6419e2ee33e329cabc9a4f9577d6d68730d))
* **CLIMATE:** fix climate state toggle not showing up in hvac mode ([#533](https://github.com/resoai/TileBoard/issues/533)) ([d2b3717](https://github.com/resoai/TileBoard/commit/d2b37179ca55aaab21760b988708a6662e4d532e)), closes [#526](https://github.com/resoai/TileBoard/issues/526)
* **dev:** automatically fix eslint errors in changed files on commit ([5d2a83d](https://github.com/resoai/TileBoard/commit/5d2a83da424303bc2a7ed94de9376dd207a4452f))
* **dev:** don't lint unstaged changes on commit ([bee9da4](https://github.com/resoai/TileBoard/commit/bee9da45fc9ad87a740523c85ba0f66bdb4feb38)), closes [#512](https://github.com/resoai/TileBoard/issues/512)
* **HOMEKIT:** make colors of ON tiles consistent ([#511](https://github.com/resoai/TileBoard/issues/511)) ([76fae10](https://github.com/resoai/TileBoard/commit/76fae10e05d69d72d0298491e25d6135198bc2da)), closes [#448](https://github.com/resoai/TileBoard/issues/448)
* fullsize popup cropped at the bottom ([#508](https://github.com/resoai/TileBoard/issues/508)) ([3cfaef8](https://github.com/resoai/TileBoard/commit/3cfaef8b8eb4b3684203f32d2e97756dc22c6e4a)), closes [#423](https://github.com/resoai/TileBoard/issues/423)

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
