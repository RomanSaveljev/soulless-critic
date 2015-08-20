# Theory of operation

This document describes the basic nuts and bolts of this application.

## Gerrit CLI

Gerrit command line interface is what the bot is communicates through. This means:

* SSH key is configured
* SSH configuration is configured
* `known_hosts` is in shape
* Bot account has **Stream Events** capability
* Bot account can view and comment on projects of interest

## Configuration

The configuration is three-fold:

* Events from all visible projects will be intercepted and acted upon:
    * Gerrit administrator configures proper permissions for the bot account
* Style checker configuration is kept along with the project's source code:
    * Developers can run checks themselves
    * Developers configure checks
* Local configuration file may help to work around the rough edges
    * Keeps per-project tweaks
    * May configure different name of checker configuration file
    * May configure what version of checker application to use
    * Configuration items are developed over the time

## Events stream

The application intercepts Gerrit events published by `gerrit stream-events` command.

## Fetching the change

A project needs to be cloned somewhere to checkout the change. The application will use
a dedicated folder for the cache.

A patchset notification will provide information on how the modifications can be retrieved:

```shell
$ git init
$ git fetch ssh://HOST:PORT/EVENT.change.project EVENT.patchSet.ref
$ git checkout FETCH_HEAD
```

, here:

* `HOST` - configured Gerrit host (e.g. `user@localhost`)
* `PORT` - configured Gerrit port
* `EVENT` - event received to patchset created callback

### Concurrency

The above is gives only a simplistic view. In practice, asynchronous operations
imply some concurrency support. For instance, new event may come from the Gerrit
stream while we are checking out the change.

## Scope of checking

A style checker will analyze every modified file completely. This command lists changed files:

```shell
$ git diff --name-status FETCH_HEAD^ FETCH_HEAD
```

Basic motivation to notify noncompliances even outside the changed lines is to ensure unified
style throughout the file. Also, this is easier to implement.

## Running a checker

A checker will be given a configuration file and a list of files to process. The application will
support different checkers and it will have to detect source code language. [This](https://github.com/github/linguist)
project looks promising for the purpose.

Checker configuration should be searched by a specific name in every parent folder of the modified
file upwards. The first hit takes precedence.

## Leaving comments

Every warning or error found by a checker will be added as a comment for the corresponding line.
The comment will target the whole line, but may include information about its target column.

Comments are added with the help of `gerrit review` command:

```shell
$ ssh -p PORT HOST gerrit review EVENT.change.number,EVENT.patchSet.number -j <JSON
```

, where:

* `HOST`, `PORT`, `EVENT` - see above
* `JSON` - review input in JSON format (ReviewInput notation from the documentation) fed over STDIN

Example of JSON:

```json
{
    "message": "OK",
    "comments": {
        "LICENSE.md": [
            {
                "side": "PARENT",
                "line": 2,
                "message": "line number 2"
            },
            {
                "side": "REVISION",
                "line": 2,
                "message": "line number 2"
            }
        ]
    }
}
```
