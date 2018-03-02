import { EventObserver, CommandEmitter, MessageBus } from '../src/index'

describe('EventObserver', () => {
  interface Events {
    foo: { value: number }
  }

  it('should observe events', () => {
    let emit!: Function
    const ob = new EventObserver<Events>(_emit => {
      emit = () => {
        _emit('foo', { value: 123 })
      }
    })

    const mock = jest.fn()
    ob.on('foo', mock)
    emit()
    expect(mock).toHaveBeenCalledWith({ value: 123 })
  })

  it('should be disposed', () => {
    let emit!: Function
    const ob = new EventObserver<Events>(_emit => {
      emit = () => {
        _emit('foo', { value: 123 })
      }
    })

    const mock = jest.fn()
    ob.on('foo', mock)
    emit()
    expect(mock).toHaveBeenCalledWith({ value: 123 })

    mock.mockClear()
    ob.dispose()
    emit()
    expect(mock).not.toHaveBeenCalled()
  })
})

describe('CommandEmitter', () => {
  interface Commands {
    bar: { message: string }
  }

  it('should emit commands', () => {
    const mock = jest.fn()
    const em = new CommandEmitter<Commands>(observe => {
      observe('bar', mock)
    })

    em.emit('bar', { message: 'Hello' })
    expect(mock).toHaveBeenCalledWith({ message: 'Hello' })
  })

  it('should be disposed', () => {
    const mock = jest.fn()
    const em = new CommandEmitter<Commands>(observe => {
      observe('bar', mock)
    })

    em.emit('bar', { message: 'Hello' })
    expect(mock).toHaveBeenCalledWith({ message: 'Hello' })

    mock.mockClear()
    em.dispose()
    em.emit('bar', { message: 'Hi' })
    expect(mock).not.toHaveBeenCalled()
  })
})

describe('MessageBus', () => {
  interface Events {
    foo: string
    bar: number
  }

  interface Commands {
    baz: boolean
    qux: { test: number }
  }

  it('should port all event observer events', () => {
    let emit1!: Function, emit2!: Function
    const ob1 = new EventObserver<Events>(emit => {
      emit1 = () => {
        emit('foo', 'Hello')
      }
    })
    const ob2 = new EventObserver<Events>(emit => {
      emit2 = () => {
        emit('bar', 123)
      }
    })

    const mock1 = jest.fn()
    const mock2 = jest.fn()
    const bus = new MessageBus<Events, Commands>([ob1, ob2], [])
    bus.on('foo', mock1)
    bus.on('bar', mock2)

    emit1()
    expect(mock1).toHaveBeenCalledWith('Hello')
    expect(mock2).not.toHaveBeenCalled()

    mock1.mockClear()
    mock2.mockClear()
    emit2()
    expect(mock1).not.toHaveBeenCalled()
    expect(mock2).toHaveBeenCalledWith(123)
  })

  it('should port all command emitter commands', () => {
    const mock1 = jest.fn()
    const mock2 = jest.fn()
    const em1 = new CommandEmitter<Commands>(observe => {
      observe('baz', mock1)
    })
    const em2 = new CommandEmitter<Commands>(observe => {
      observe('qux', mock2)
    })

    const bus = new MessageBus<Events, Commands>([], [em1, em2])
    bus.emit('baz', true)
    expect(mock1).toHaveBeenCalledWith(true)
    expect(mock2).not.toHaveBeenCalled()

    mock1.mockClear()
    mock2.mockClear()
    bus.emit('qux', { test: 42 })
    expect(mock1).not.toHaveBeenCalled()
    expect(mock2).toHaveBeenCalledWith({ test: 42 })
  })

  it('should dispose event observer', () => {
    let emit!: Function
    const ob = new EventObserver<Events>(_emit => {
      emit = () => {
        _emit('foo', 'Hello')
      }
    })

    const mock = jest.fn()
    const bus = new MessageBus<Events, Commands>([ob], [])
    bus.on('foo', mock)

    emit()
    expect(mock).toHaveBeenCalled()

    mock.mockClear()
    bus.dispose()
    emit()
    expect(mock).not.toHaveBeenCalled()
  })

  it('should dispose command emitter', () => {
    const mock = jest.fn()
    const em = new CommandEmitter<Commands>(observe => {
      observe('baz', mock)
    })

    const bus = new MessageBus<Events, Commands>([], [em])
    bus.emit('baz', true)
    expect(mock).toHaveBeenCalled()

    mock.mockClear()
    bus.dispose()
    bus.emit('baz', true)
    expect(mock).not.toHaveBeenCalled()
  })
})
