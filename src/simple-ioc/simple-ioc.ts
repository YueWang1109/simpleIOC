interface IValue<T> {
  obj?: T;
  cls?: IClass<T>;
  singleton: boolean;
}
interface IClass<T> {
  new (...args: any[]): T;
}

class SimpleIoc {
  private _repo: Map<symbol, IValue<any>>;
  private _isCreating: Map<symbol, IValue<any>>;
  constructor() {
    this._repo = new Map<symbol, IValue<any>>();
    this._isCreating = new Map<symbol, IValue<any>>();
  }
  bindObject<T>(key: symbol, obj: T): void {
    if (this._repo.has(key)) {
      this._repo.delete(key);
    }
    const value: IValue<T> = {obj, singleton: true};
    this._repo.set(key, value);
  }
  bindClass<T>(key: symbol, cls: IClass<T>, isSingle: boolean = true): void {
    if (this._repo.has(key)) {
      this._repo.delete(key);
    }
    const value: IValue<T> = {cls, singleton: isSingle};
    this._repo.set(key, value);
  }
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
  remove<T>(key: symbol): boolean {
    return this._repo.delete(key);
  }
}

export default SimpleIoc;
