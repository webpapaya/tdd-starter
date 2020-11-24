import {promiseThat, isFulfilledWith} from 'hamjest';

class SclablePromise {
  constructor(callback) {
    this.callback = callback
    this.callback(this.resolve.bind(this))
  }

  resolve(value) {
    this.value = value
  }

  then(thenCallback) {
    thenCallback(this.value)
    return this
    // this.thenCallback = thenCallback
    // TODO: tests are chainable
  }
}

it('WHEN promise resolves, returns value', () => {
  return promiseThat(new SclablePromise((resolve) => resolve('test')), 
    isFulfilledWith('test'))
})