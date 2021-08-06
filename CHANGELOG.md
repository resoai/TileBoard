# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.6.3](https://github.com/resoai/TileBoard/compare/v2.6.2...v2.6.3) (2021-08-06)


### Bug Fixes

* **light:** fix light brightness adjustment buttons after HA update ([#746](https://github.com/resoai/TileBoard/issues/746)) ([dd9510f](https://github.com/resoai/TileBoard/commit/dd9510f1e4c484b8d2b3abcb059d70c7006c7718)), closes [#743](https://github.com/resoai/TileBoard/issues/743)

### [2.6.2](https://github.com/resoai/TileBoard/compare/v2.6.1...v2.6.2) (2021-07-21)

### [2.6.1](https://github.com/resoai/TileBoard/compare/v2.6.0...v2.6.1) (2021-05-23)


### Bug Fixes

* **deps:** update dependency node-sass to v6 ([#716](https://github.com/resoai/TileBoard/issues/716)) ([a239003](https://github.com/resoai/TileBoard/commit/a239003475192a4baed3f3e85588d24d7c281896))
* **HISTORY:** fix tooltip time for some locales ([#724](https://github.com/resoai/TileBoard/issues/724)) ([e2c5639](https://github.com/resoai/TileBoard/commit/e2c5639be74647fab2e0e7d539a76415ea42d81b))
* suppress undefined postfix ([#722](https://github.com/resoai/TileBoard/issues/722)) ([d7132ee](https://github.com/resoai/TileBoard/commit/d7132ee257ccf428b1008fdd62aef7a7314c185f))

## [2.6.0](https://github.com/resoai/TileBoard/compare/v2.5.0...v2.6.0) (2021-05-01)


### Features

* onLayout hook triggered on items being added/remove ([#703](https://github.com/resoai/TileBoard/issues/703)) ([94a1846](https://github.com/resoai/TileBoard/commit/94a184604d6f2659a4a6ed1b82f626b7e6affdd9))


### Bug Fixes

* **CLIMATE:** localized/customized lookup for climate options ([f420183](https://github.com/resoai/TileBoard/commit/f420183b2e372f8dc9bc98a07b3363a6434a9079))
* **LIGHT:** show brightness control only when on ([#707](https://github.com/resoai/TileBoard/issues/707)) ([17a5a63](https://github.com/resoai/TileBoard/commit/17a5a6362077673ab89545394d60b9c8735fe8d9))
* **MEDIA_PLAYER:** localized translation for mediaplayer "Source" label ([af9b961](https://github.com/resoai/TileBoard/commit/af9b9618ea5407c27d42e6e14ff6d3cd29eac1ab))

## [2.5.0](https://github.com/resoai/TileBoard/compare/v2.4.1...v2.5.0) (2021-04-20)


### Features

* **SLIDER:** add vertical slider option and improve design ([#672](https://github.com/resoai/TileBoard/issues/672)) ([e713089](https://github.com/resoai/TileBoard/commit/e7130896519a4ea610140960f86ec94c4c4c30cf))

### [2.4.1](https://github.com/resoai/TileBoard/compare/v2.4.0...v2.4.1) (2021-04-15)


### Bug Fixes

* allow overriding REST API domain for ingress ([5987c16](https://github.com/resoai/TileBoard/commit/5987c16fd776219f24ce24f5226777837488a604))
* some issues in default example that triggered console errors ([f95b918](https://github.com/resoai/TileBoard/commit/f95b9184e657066d073e7a17b5cae1c3a15e6293))

## [2.4.0](https://github.com/resoai/TileBoard/compare/v2.3.1...v2.4.0) (2021-04-11)


### Features

* **addon:** define window variables for overriding server and API URLs ([a52ac5b](https://github.com/resoai/TileBoard/commit/a52ac5be70d0ff5ac6867feff60b38c67d1fcbcd))


### Bug Fixes

* **CAMERA_STREAM:** fix frozen streams playing on load ([#694](https://github.com/resoai/TileBoard/issues/694)) ([d3c51fe](https://github.com/resoai/TileBoard/commit/d3c51feb419b5096b3f24dab19696ecf9130a3c9))
* **WEATHER_LIST:** format date column using date filter ([#696](https://github.com/resoai/TileBoard/issues/696)) ([c19f4b6](https://github.com/resoai/TileBoard/commit/c19f4b69dc105c2bbb1e0878e9ba82b96719c3de))

### [2.3.1](https://github.com/resoai/TileBoard/compare/v2.3.0...v2.3.1) (2021-04-07)


### Bug Fixes

* **CAMERA_STREAM:** stream fails to resume after being suspended ([#692](https://github.com/resoai/TileBoard/issues/692)) ([bed202a](https://github.com/resoai/TileBoard/commit/bed202a3463f03a36513dfe3fed7afddcf2149a0)), closes [#688](https://github.com/resoai/TileBoard/issues/688)

### [2.3.1](https://github.com/resoai/TileBoard/compare/v2.3.0...v2.3.1) (2021-04-07)


### Bug Fixes

* **CAMERA_STREAM:** stream fails to resume after being suspended ([#692](https://github.com/resoai/TileBoard/issues/692)) ([bed202a](https://github.com/resoai/TileBoard/commit/bed202a3463f03a36513dfe3fed7afddcf2149a0)), closes [#688](https://github.com/resoai/TileBoard/issues/688)

## [2.3.0](https://github.com/resoai/TileBoard/compare/v2.2.0...v2.3.0) (2021-04-05)


### Features

* support sensors which are timestamps (like uptime sensor) ([#677](https://github.com/resoai/TileBoard/issues/677)) ([b417812](https://github.com/resoai/TileBoard/commit/b417812ef8ddf7640965581f0c7a892e532561eb)), closes [#671](https://github.com/resoai/TileBoard/issues/671)
* **WEATHER:** localized number values and support "pressure" key ([#666](https://github.com/resoai/TileBoard/issues/666)) ([3a1b206](https://github.com/resoai/TileBoard/commit/3a1b2066c860a4e2e0fde0175eac6280ef92e1cd))
* GRID groupAlignment option ([#662](https://github.com/resoai/TileBoard/issues/662)) ([719d424](https://github.com/resoai/TileBoard/commit/719d424287382dfd2acb76051a7bc7480194a212))


### Bug Fixes

* **deps:** update dependency hls.js to v1 ([#683](https://github.com/resoai/TileBoard/issues/683)) ([570f5ce](https://github.com/resoai/TileBoard/commit/570f5ce46db0e8f6f401c7eb9d05c3d2f507c6cd))
* don't include custom.css in the release ([#686](https://github.com/resoai/TileBoard/issues/686)) ([438bc8b](https://github.com/resoai/TileBoard/commit/438bc8b650a72cc18f9074b4ede01fd66685f59d))
* **locales:** make moment follow the locale set in the config ([#680](https://github.com/resoai/TileBoard/issues/680)) ([4126d1a](https://github.com/resoai/TileBoard/commit/4126d1a0e1dee9da5477a6ee03be9fd81bdae7e1)), closes [#678](https://github.com/resoai/TileBoard/issues/678)
* **WEATHER, WEATHER_LIST:** replace darksky with openweathermap in examples ([#676](https://github.com/resoai/TileBoard/issues/676)) ([1f5f541](https://github.com/resoai/TileBoard/commit/1f5f54177b3b2752b5ca1b0b0eb4f61d4dd79889)), closes [#558](https://github.com/resoai/TileBoard/issues/558)

## [2.2.0](https://github.com/resoai/TileBoard/compare/v2.1.3...v2.2.0) (2021-03-03)


### Features

* locale option for dates and number formatting ([#644](https://github.com/resoai/TileBoard/issues/644)) ([ce236f2](https://github.com/resoai/TileBoard/commit/ce236f2ffc3276cf2938c64f08cd1be61169661b))


### Bug Fixes

* **clock:** show locale-formatted time ([#651](https://github.com/resoai/TileBoard/issues/651)) ([86c281e](https://github.com/resoai/TileBoard/commit/86c281e178140a1944cb561f5ae861127e67a837))
* **DOOR_ENTRY:** non-clickable items when opening popup programmatically ([#664](https://github.com/resoai/TileBoard/issues/664)) ([95373c7](https://github.com/resoai/TileBoard/commit/95373c7ebf0ad2cdeb9dbdc8dcf2fcecfd1c1fcf))
* **SCREENSAVER:** fix console errors when using weather tile ([#663](https://github.com/resoai/TileBoard/issues/663)) ([1669a12](https://github.com/resoai/TileBoard/commit/1669a128a48b42a81a415802b5cf5194f5af8d01))
* **SLIDER:** update value in real-time on change ([#652](https://github.com/resoai/TileBoard/issues/652)) ([7d83970](https://github.com/resoai/TileBoard/commit/7d83970e8f4144280c3e8d80841ca250f982edf4))
* **WEATHER:** update state mappings and documentation ([#661](https://github.com/resoai/TileBoard/issues/661)) ([40114d8](https://github.com/resoai/TileBoard/commit/40114d87dda466ce359f0fedacd1d1b0a44d6c86))
* don't include empty custom.css in the release ([d038e04](https://github.com/resoai/TileBoard/commit/d038e04969bee801869bf1b6bb59711a60474001)), closes [#564](https://github.com/resoai/TileBoard/issues/564)
* **WEATHER:** minor fixes for weather icon ([e739b51](https://github.com/resoai/TileBoard/commit/e739b5149739763849a2f7f654973fa669cafbb4))

### [2.1.3](https://github.com/resoai/TileBoard/compare/v2.1.2...v2.1.3) (2021-01-31)


### Bug Fixes

* update history tile's start date on state change ([#581](https://github.com/resoai/TileBoard/issues/581)) ([af1d878](https://github.com/resoai/TileBoard/commit/af1d878de37667512227ca381cfc2318e5a2533b))
* **ci:** switch to latest version of release action ([46875cf](https://github.com/resoai/TileBoard/commit/46875cff8c6cf5f56716c8b503fe79c552495c56))
* **styles:** Fix divisions in SCSS files after updating to less 4 ([71d7ff4](https://github.com/resoai/TileBoard/commit/71d7ff416b2d4f8544c3ad3a2951880c65ac7f59))

### [2.1.2](https://github.com/resoai/TileBoard/compare/v2.1.1...v2.1.2) (2020-11-30)


### Bug Fixes

* add polyfills for URL/URLSearchParams ([637e37f](https://github.com/resoai/TileBoard/commit/637e37f73477ba800bc49e8ef28997efc44ab26b))
* ensure app is initialized even when config fails to load ([4d3ec12](https://github.com/resoai/TileBoard/commit/4d3ec123d08722f2fea98f6129b6846b434f6642))
* **POPUP:** merge tile defaults when passing newly created tile object ([#555](https://github.com/resoai/TileBoard/issues/555)) ([63e2b87](https://github.com/resoai/TileBoard/commit/63e2b873a457f04e089d8d82e4b0d5d73743aac8)), closes [#553](https://github.com/resoai/TileBoard/issues/553)
* incorrect message telling user to copy example config to "dist" ([94a9801](https://github.com/resoai/TileBoard/commit/94a9801a7244ecfac0048ba912eb42203b7a5599))

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
