type StringKeyOf<T> = Extract<keyof T, string>

export interface Emit<Payloads> {
  <Name extends StringKeyOf<Payloads>>(
    name: Name,
    payload: Payloads[Name]
  ): void
}

export interface Observe<Payloads> {
  <Name extends StringKeyOf<Payloads>>(
    name: Name,
    cb: (payload: Payloads[Name]) => void
  ): void
}

export type Fn1 = (value: any) => void

function emit(
  listeners: Record<string, Fn1[]>,
  name: string,
  payload: any
): void {
  if (listeners.hasOwnProperty(name)) {
    const list = listeners[name]
    list.forEach(listener => listener(payload))
  }
}

function observe(
  listeners: Record<string, Fn1[]>,
  name: string,
  cb: (payload: any) => void
): void {
  const list = listeners.hasOwnProperty(name) ? listeners[name] : []
  list.push(cb)
  listeners[name] = list
}

export class EventObserver<Events> {
  private listeners: Record<string, Fn1[]> | undefined = {}

  constructor(fn: (emit: Emit<Events>) => void) {
    fn((name, payload) => {
      if (this.listeners) {
        emit(this.listeners, name, payload)
      }
    })
  }

  on<Name extends StringKeyOf<Events>>(
    name: Name,
    cb: (payload: Events[Name]) => void
  ): void {
    if (this.listeners) {
      observe(this.listeners, name, cb)
    }
  }

  dispose(): void {
    if (this.listeners) {
      this.listeners = undefined
    }
  }
}

export class CommandEmitter<Commands> {
  private listeners: Record<string, Fn1[]> | undefined = {}

  constructor(fn: (observe: Observe<Commands>) => void) {
    fn((name, cb) => {
      if (this.listeners) {
        observe(this.listeners, name, cb)
      }
    })
  }

  emit<Name extends StringKeyOf<Commands>>(
    name: Name,
    payload: Commands[Name]
  ): void {
    if (this.listeners) {
      emit(this.listeners, name, payload)
    }
  }

  dispose(): void {
    if (this.listeners) {
      this.listeners = undefined
    }
  }
}

export class MessageBus<Events, Commands> {
  constructor(
    private eventObservers: EventObserver<Events>[],
    private commandEmitters: CommandEmitter<Commands>[]
  ) {}

  on<Name extends StringKeyOf<Events>>(
    name: Name,
    cb: (payload: Events[Name]) => void
  ): void {
    this.eventObservers.forEach(e => {
      e.on(name, cb)
    })
  }

  emit<Name extends StringKeyOf<Commands>>(
    name: Name,
    payload: Commands[Name]
  ): void {
    this.commandEmitters.forEach(c => {
      c.emit(name, payload)
    })
  }

  dispose(): void {
    // tslint:disable-next-line
    ;(this.eventObservers as { dispose(): void }[])
      .concat(this.commandEmitters)
      .forEach(x => x.dispose())
  }
}
