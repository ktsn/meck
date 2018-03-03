# Meck

Small and type safe message bus with well module separation.

## Install

```sh
$ npm install meck
# or
$ yarn add meck
```

## Concept

Meck has two concepts - event and command. Event indicates something is happened which has a name with any form of payload. For example, file system watcher's event can be an event on Meck. Command is similar to event because it has a name and a payload too but it is more directive. For example, saving a file can be a command on Meck.

The relation of event and command is similar to input and output. In fact, we input some data with event, then process it and may output the result with command in Meck. This helps you to separate input and output logic.

## Usage

### Declare Events and Commands

At first, you should declare your events and commands types. You need some object interface that has available event name as a key and its payload type as a value. For example, if you want to declare an event which is named `fileChanged` with `{ path: string }` payload:

```ts
interface Events {
  fileChanged: { path: string }
}
```

You declare a commands type as same as the events type. The below example is declaring `saveFile` command which has a object payload including `{ count: number }` property.

```ts
interface Commands {
  saveFile: { content: string }
}
```

### Implement EventObserver and CommandEmitter

Next, you should implement `EventObserver` and `CommandEmitter`. `EventObserver` listens some events while `CommandEmitter` dispatches some commands. The constructors of both class will receive a callback having a parameter of function. In the callback you write a bridge between Meck and external modules. For example, you port some events when external module provide some events in the `EventObserver` while you observe some commands and notify them to external ones in `CommandEmitter`. Note that you should pass the events and commands types as a generic type to specify available events and commands.

```ts
import { EventObserver, CommandEmitter } from 'meck'

const fileEvents = new EventObserver<Events>(emit => {
  fs.watchFile('test.txt', () => {
    emit('fileChanged', {
      path: 'test.txt'
    })
  })
})

const fileCommands = new CommandEmittter<Commands>(observe => {
  observe('saveFile', payload => {
    fs.writeFileSync('log.txt', payload.content)
  })
})
```

### Generate MessageBus

Then, you generate `MessageBus` instance which gather all events and commands on one place.

```ts
import { MessageBus } from 'meck'

const bus = new MessageBus([fileEvents], [fileCommands])

// Observe event
bus.on('fileChanged', payload => {
  // Emit command
  bus.emit('saveFile', {
    content: 'changed: ' + payload.path
  })
})
```

## License

MIT
