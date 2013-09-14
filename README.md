# jsonwatch

Json file reader, which will emit events on the Json file content. It will also watch your Json file for any changes and emit events which will tell you about the changes. This module was intended for reading/watching configuration files which may change while running an app.

## Getting started

First, require() `jsonwatch` and load your Json file

 ```javascript
var JsonWatch = require('jsonwatch');
var config = new JsonWatch('./config.json');
 ```

Now, you should add listeners for your Json structure.

## Methods

### `.on(event, fn)`

Register an event handler fn.

### `.once(event, fn)`

Register a single-shot event handler fn, removed immediately after it is invoked the first time.

### `.off(event, fn)`

Remove event handler fn, or pass only the event name to remove all handlers for event.

### `.listeners(event)`

Return an array of callbacks, or an empty array.

### `.hasListeners(event)`

Check if this emitter has event handlers.

## Events

### `add` event

Something was added to the Json.

Event arguments:

1. The path to what was added.
2. The value that was added.

### `cng` event

Something in the Json was changed.

Event arguments:

1. The path to what was changed.
2. The value that was before the change.
3. The value after the change.

### `err` event

There was an error.

Event arguments:

1. An Error.

### `rm` event

Something was removed from the Json.

Event arguments:

1. The path of what was removed.
2. The value that was removed.

## Paths in the Json

 ```json
{
  "users": {
    "alfred": {
      "password": "qwerty"
    },
    "olof": {
      "password": "123456",
      "aliases": [ "olle", "lol", "floflo" ]
    }
  }
}
 ```
 
When loading the Json above, those events will be emitted:

1. `add`, with arguments: 1. `"/users"` and 2. `{}`
2. `add`, with arguments: 1. `"/users/alfred"` and 2. `{}`
3. `add`, with arguments: 1, `"/users/alfred/password"` and 2. `"qwerty"``
4. `add`, with arguments: 1. `"/users/olof"` and 2. `{}`
5. `add`, with arguments: 1, `"/users/olof/password"` and 2. `"123456"``
6. `add`, with arguments: 1. `"/users/olof/aliases"` and 2. `[ "olle, "lol", "floflo" ]`

So, the paths are made from Json object keys. Any other type in a Json will become the "value".

