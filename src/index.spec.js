import {promiseThat, isFulfilledWith} from 'hamjest';

class SclablePromise {
  constructor(callback) {
    this.callback = callback
    this.callback(this.resolve.bind(this))
  }

  resolve(value) {
    this.value = value
    if (this.thenCallback) {
      this.thenCallback(value)
    }
    
  }

  then(thenCallback) {
    this.thenCallback = thenCallback
    return new SclablePromise((resolve) => resolve(thenCallback(this.value)))
  }
}

it('WHEN promise resolves, returns value', () => {
  return promiseThat(new SclablePromise((resolve) => resolve('test')), 
    isFulfilledWith('test'))
})

it('WHEN promise are async (using setTimeout), returns value', () => {
  return promiseThat(new SclablePromise((resolve) => setTimeout(() => resolve('test')), 0), 
    isFulfilledWith('test'))
})

it('WHEN multiple listeners, returns passes value to all of them', () => {
  const promise = new SclablePromise((resolve) => resolve('test'))
  
  return promiseThat(Promise.all([
    promise,
    promise.then((value) => value.toUpperCase())
  ]), isFulfilledWith(['test', 'TEST']))
})