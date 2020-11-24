import {promiseThat, isFulfilledWith} from 'hamjest';

class SclablePromise {
  constructor(callback) {
    this.state = "pending"
    this.onFulfillments = []
    setTimeout(() => callback(this.resolve.bind(this)), 0)
  }

  resolve(value) {
    if (this.state === "fulfilled") { return; }
    this.value = value
    this.state = "fulfilled"
    this.onFulfillments.forEach((onFulfillment) => onFulfillment(value))
  }

  then(thenCallback) {
    return new SclablePromise((resolve) => {
      const resolveCallback = (value) => {
        resolve(this._isPromise(value)
          ? value.then(thenCallback)
          : thenCallback(value))
      }

      if (this.state === 'fulfilled') {
        resolveCallback(this.value)
      } else {
        this.onFulfillments.push(resolveCallback)
      }
    })
  }
  
  _isPromise(value) {
    return value && value.then
  }
}

[SclablePromise, Promise].forEach((Constructor) => {
  describe(Constructor.name, () => {
    it('WHEN promise resolves, returns value', () => {
      return promiseThat(new Constructor((resolve) => resolve('test')), 
        isFulfilledWith('test'))
    })
    
    it('WHEN promise are async (using setTimeout), returns value', () => {
      return promiseThat(new Constructor((resolve) => setTimeout(() => resolve('test')), 0), 
        isFulfilledWith('test'))
    })
    
    it('WHEN multiple listeners AND one is chained, returns passes value to all of them', () => {
      const promise = new Constructor((resolve) => resolve('test'))
      
      return promiseThat(Promise.all([
        promise,
        promise.then((value) => value.toUpperCase())
      ]), isFulfilledWith(['test', 'TEST']))
    })
    
    it('WHEN multiple listeners, returns all value', () => {
      const promise = new Constructor((resolve) => resolve('test'))
      
      return promiseThat(Promise.all([
        promise,
        promise
      ]), isFulfilledWith(['test', 'test']))
    })
    
    it('WHEN multiple listeners, returns all value', () => {
      const promise = new Constructor((resolve) => setTimeout(() => resolve('test'), 100))
      
      return promiseThat(Promise.all([
        promise.then(() => 1),
        promise.then(() => 2),
      ]), isFulfilledWith([1, 2]))
    })
    
    
    it('WITH multiple chains, resolves in order', () => {
      const promise = new Constructor((resolve) => resolve('test'))
      
      return promiseThat(promise.then((value) => value.toUpperCase()).then((value) => value.length), 
        isFulfilledWith(4))
    })
    
    it('WHEN promise returns promise, flattens result', () => {
      const promise = new Constructor((resolve) => resolve('test'))
        .then(() => new Constructor((resolve) => resolve('test2')))
      
      return promiseThat(promise, 
        isFulfilledWith('test2'))
    })

    it('WHEN promise returns is pending and returns promise, flattens result', () => {
      const promise = new Constructor((resolve) => setTimeout(() => resolve('test'), 0))
        .then(() => new Constructor((resolve) => resolve('test2')))
      
      return promiseThat(promise, 
        isFulfilledWith('test2'))
    })

    it('WHEN promise calls resolve twice', () => {
      const promise = new Constructor((resolve) => {
        resolve("test")
        resolve("test1")
      })
      
      return promiseThat(promise, 
        isFulfilledWith('test'))
    })
  }) 
})
