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

## 1.2.1

### Changed

- Add a config file to configure our commands without needing to rebuild the
  service.

## 1.3.0

### Changed

- Remove the `animatedEmoji` and `embedLink` functionalities from the bot.
  This should be handled by the NQN bot, which does these 2 jobs already and
  way more.

## 1.4.0

### Fixed

- `-setrep` error with spacing between the parameters. (See [#82](https://github.com/viet-aus-it/vait-discord-bot/issues/82) and [#85](https://github.com/viet-aus-it/vait-discord-bot/pull/85))

### Added

- Allow thanking (or `-giverep`) to multiple users at the same time. (See [#86](https://github.com/viet-aus-it/vait-discord-bot/issues/86) and [#87](https://github.com/viet-aus-it/vait-discord-bot/pull/87))

## 1.4.1

### Added

- `-allcap` function: `M A K E  Y O U R  T E X T  L O O K S  L I K E  T H I S`. (See [#50](https://github.com/viet-aus-it/vait-discord-bot/issues/50) and [#93](https://github.com/viet-aus-it/vait-discord-bot/pull/93))

## 2.0.0

### Changed

- All commands are now changed to use slash commands instead of reading chat content. (See [#92](https://github.com/viet-aus-it/vait-discord-bot/issues/92) [#97](https://github.com/viet-aus-it/vait-discord-bot/pull/97))
- Available commands:
  - `/8ball [question]`
  - `/allcap [sentence]`
  - `/cowsay [sentence]`
  - `/hit [@target1] [@target2] ... [@target10]` (`target2 - 10` are optional)
  - `/insult [name/@target]`
  - `/mock [sentence]`
  - `/poll [question] [opt1] [opt2] ... [opt10]` (`opt3 - 10` are optional)
  - `/qotd`
  - `/rep` now has to be used with a subcommand.
    - `/rep check`
    - `/rep give`
    - `/rep take`
    - `/rep set`
  - `/weather`
- The `thanks` keyword can still be used with multiple option, but is now hard limited to 10 max. See below.
- All commands that had dynamic multiple mentions is now hard limited, because Discord slash commands API doesn't allow
  dynamic parameter registration. Affected commands:
  - `/give rep` & `thanks` keyword is now hard limited to give rep to 10 people at a time.
  - `/poll` now has a question parameter, and a min of 2 options, and max of 9 options.

### Security

- Update Node version in Docker and in `.nvmrc` to use version `16.15`.

## 2.0.1

### Changed

- Add a link in our README to our usage and supported commands in our wiki page.
- Change the `/rep set` and `/rep take` command description to show it's an Admin command explicitly.

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
