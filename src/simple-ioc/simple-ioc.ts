interface IValue<T> {
  obj?: T;
  cls?: IClass<T>;
  singleton: boolean;
}
interface IClass<T> {
  new (...args: any[]): T;
}

class SimpleIoc {
  private _repo: Map<symbol, IValue<any>>; //use this map to store all registered objects/classes
  private _isCreating: Map<symbol, IValue<any>>; // all on creating dependencies are put into this map to detect circular dependency

  constructor() {
    this._repo = new Map<symbol, IValue<any>>();
    this._isCreating = new Map<symbol, IValue<any>>();
  }
  /**
   * use bindObject to bind any variables (number/string/array/object)
   * @param key a unique symbol as the key
   * @param obj registered dependent object
   */
  bindObject<T>(key: symbol, obj: T): void {
    if (this._repo.has(key)) {
      this._repo.delete(key);
    }
    const value: IValue<T> = {obj, singleton: true};
    this._repo.set(key, value);
  }

  /**
   * use bindClass to register class into the container
   * @param key a unique symbol as the key
   * @param cls the registered dependent class
   * @param isSingle settings for singleton
   */
  bindClass<T>(key: symbol, cls: IClass<T>, isSingle: boolean = true): void {
    if (this._repo.has(key)) {
      this._repo.delete(key);
    }
    const value: IValue<T> = {cls, singleton: isSingle};
    this._repo.set(key, value);
  }

  /**
   *
   * @param key a unique symbol as the key
   * @returns the correspond dependencies or undefined if not found
   * this use method also helps to detect circular dependencies in constructor.
   * a single dependency will be returned if the singleton is true.
   */
  use<T>(key: symbol): T | undefined {
    const value = this._repo.get(key) as IValue<T>;
    if (!value) return;
    if (this._isCreating.has(key)) {
      this._isCreating.delete(key);
      throw Error("circular dependencies detected");
    }
    if (value.singleton) {
      if (!value.obj && value.cls) {
        this._isCreating.set(key, value);
        value.obj = new value.cls();
        this._isCreating.delete(key);
      }
      return value.obj;
    } else if (value.cls) {
      this._isCreating.set(key, value);
      const result = new value.cls();
      this._isCreating.delete(key);
      return result;
    }
  }
  /**
   *
   * @param key
   * @returns a boolean to indicate status of deleting the dependency
   */
  remove<T>(key: symbol): boolean {
    return this._repo.delete(key);
  }
}

export default SimpleIoc;
