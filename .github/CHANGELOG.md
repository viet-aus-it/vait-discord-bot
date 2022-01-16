# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

Developers should add to the **Unreleased** section once they feel their branch is ready.

## 1.0.0

### Added

- Initial project setup
- Added reps, thanks, "đánh" features
- Added mock someone feature
- Added ask 8ball (-8ball) and quote of the day (-qotd) feature
- Added animated emoji for non Nitro user
- Add weather, cowsay and insult feature

### Disabled

These 3 changes are based on Discord webhooks, and has been temporarily disabled for this
release because Discord API has changed by the time this was released.

- Added embed message function when user paste in a URL of another message
- Added poll function when user want to create a simple poll
- The embed message and poll functions are currently disabled because Discord has updated their APIs.

## 1.0.1

### Added

- Add GHCR path to the package name for deployment
- Add a CI/CD Pipeline to deploy the service
- Enable Pipeline to build docker image

### Changed

- Add MSW package to simulate an endpoint in running node-fetch-related tests
  and remove node-fetch mocks in said test

## 1.1.0

### Added

- Update DiscordJS to v13 to fit with the new Discord API
- Add Guild Intent to Discord client config
- Revert the disabling of webhook related commands

## 1.1.1

### Changed

- Replace all `mocked` imports from ts-jest with `jest.mocked`

## 1.1.2

### Changed

- Replace all calls to the faker package with `@faker-js/faker`

## 1.2.0

### Changed

- Add a webpack and esbuild build process into our build and tests pipeline.
  - The tests will now be run with esbuild jest, making it run a lot faster
  - The package will now be bundled using webpack and esbuild, making it fast
  and also reducing the size of our deployment package.

## \[Unreleased\]

[//]: # (Template:)

[//]: # (Version number)
[//]: # (### Added)

[//]: # ()
[//]: # (### Changed)

[//]: # ()
[//]: # (### Deprecated)

[//]: # ()
[//]: # (### Removed)

[//]: # ()
[//]: # (### Fixed)

[//]: # ()
[//]: # (### Security)
