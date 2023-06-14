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

## 2.1.0

### Added

- Add a `/referral` command to get and add a referral code for a service.

## 2.2.0

### Added

- Add a `/disclaimer` command to get and add a (joke) disclaimer text.

### Changed

- The deployment process will now run more continuously, and involves less baby sitting.

## 2.3.0

### Changed

- Improved referral features

## 2.4.0

### Changed

- Migrate to DiscordJS v14 !!

## 2.4.1

### Changed

- Remove the restart policy for the db-migrate service. Because "No" is already the default.
- Move the port config from `docker-compose.yml` into an override file, since it's only needed
in development, and was messing up deployments.

## 2.4.2

### Changed

- Move the port config from `docker-compose.yml` into an override file, since it's only needed
  in development, and was messing up deployments.

## 2.4.3

### Changed

- Functionality: Now tries to create and/or get the author user before giving, taking or setting rep to the recipient.
  This was causing an error where a newly joined member cannot give rep or thank someone in the server.
- Pipeline: The `prisma generate` step is now put into the `setup repo` step, since it's not related to the tests.

## 2.4.4

### Changed

- Migrate our suite from `swc` back to using `esbuild` again since the tooling is more mature now,
  guaranteeing fast builds and having the same output as our previous releases.

## 2.4.5

### Fixed

- Fixed a bug where referral date option in the command wasn't registered as required, and it was causing an
  error in the app because it actually was required to resolve that.

### Changed

- Remove staging deployment step
- Unpin prisma packages version because the build script now take its version directly from the package.json
  instead of hard-coding.

## 2.4.6

### Changed

- Change the config for test coverage ignore paths, now it's showing correctly.
- Change the deployment workflow, now it correctly tags the production image.
- Update ESBuild config to avoid the hat `^` when finding prisma assets.
- Temporarily back off of bundling external dependencies for now to fix an issue with code bundling.

## 2.4.6a

### Changed

- Re-enabled bundling external dependencies, hard-locking `@discordjs/rest` package to 1.0.0 for now,
  because 1.0.1 breaks bundling

## 2.4.6b

### Fixed

- Fix an error where the bot was missing a MessageContent intent so it cannot read the `thank` keyword.
  See [#122](https://github.com/viet-aus-it/vait-discord-bot/issues/122) and [#123](https://github.com/viet-aus-it/vait-discord-bot/pull/123)

## 2.4.6c

- Revert broken 2.5.0 build

## 2.6.0

### Added

- Add basic role functionality. See [#125](https://github.com/viet-aus-it/vait-discord-bot/pull/125)

## 2.6.1

### Changed

- Fix tagged username in question for 8ball. See [#127](https://github.com/viet-aus-it/vait-discord-bot/pull/127)

## 2.6.2

### Added

- Add Powerball functions. See [#128](https://github.com/viet-aus-it/vait-discord-bot/pull/128)

## 2.7.0

### Changed

- Update dependencies and Node runtime to v18. This includes:
  - introducing the latest version of DiscordJS, and TypeScript 5.0.
  - Updating node-fetch to version 3 for ESM compatibility
  - Fix a borken test with new referral
  - Split up test and lint actions to run in parallel
  - See [#132](https://github.com/viet-aus-it/vait-discord-bot/pull/132)

### Added

- Add a script to delete global commands if deployed by accident

### Fixed

- Fix some typo in the docs. See [#130](https://github.com/viet-aus-it/vait-discord-bot/pull/130)

## 2.7.1

### Added

- Add the pin message feature. See [#133](https://github.com/viet-aus-it/vait-discord-bot/pull/133)

## 2.8.0

### Added

- Add the pin command in Discord Menu Context. See [#138](https://github.com/viet-aus-it/vait-discord-bot/pull/138)

### Changed

- Update the base to use `pnpm` version 8. See [#141](https://github.com/viet-aus-it/vait-discord-bot/pull/141)

## 2.8.1

### Added
- Enable giving rep to the birthday person. See [#136](https://github.com/viet-aus-it/vait-discord-bot/issues/136)
- Support giving thanks in more languages. See [#137](https://github.com/viet-aus-it/vait-discord-bot/issues/137)

## 2.9.0

### Added
- Rep Leaderboard subcommand. See [#129](https://github.com/viet-aus-it/vait-discord-bot/issues/129) & [#147](https://github.com/viet-aus-it/vait-discord-bot/issues/147).
- Reminder feature. See [#13](https://github.com/viet-aus-it/vait-discord-bot/issues/13) & [#146](https://github.com/viet-aus-it/vait-discord-bot/issues/146)

### Changed
- Updated and cleanup dependencies. See [#148](https://github.com/viet-aus-it/vait-discord-bot/issues/148)
- Update build output to Node18. See [#149](https://github.com/viet-aus-it/vait-discord-bot/issues/149)

## 2.9.1

### Fixed
- Update the env variables in the deployment script so the env variables are picked up by Docker after deployment.

## 2.10.0

### Added
- Add `autobump-threads` admin command to set a command to be autobumped. See [#89](https://github.com/viet-aus-it/vait-discord-bot/issues/89) & [#156](https://github.com/viet-aus-it/vait-discord-bot/issues/156)

### Changed

- Silence error loggings while testing
- Migrate our linting + formatting setup from ESLint + Prettier to Rome
- Remove the `/pin` slash command now that the Context Menu Command is working way better.
- Reformat the `command` module into `builder` and `deploy-command` module for clarity.
- Add a new slash command `/removeuserbyrole`. See [#153](https://github.com/viet-aus-it/vait-discord-bot/issues/153)

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
