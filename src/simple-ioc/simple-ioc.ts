interface IValue<T> {
  obj?: T;
  cls?: IClass<T>;
}
interface IClass<T> {
  new (...args: any[]): T;
}

class SimpleIoc {
  private _repo: Map<symbol, IValue<any>>;
  constructor() {
    this._repo = new Map<symbol, IValue<any>>();
  }
  bindObject<T>(key: symbol, obj: T): void {
    if (this._repo.has(key)) {
      this._repo.delete(key);
    }
    const value: IValue<T> = {obj};
    this._repo.set(key, value);
  }
  bindClass<T>(key: symbol, cls: IClass<T>, isSingle: boolean = true): void {
    if (this._repo.has(key)) {
      this._repo.delete(key);
    }
    const value: IValue<T> = {cls};
    this._repo.set(key, value);
  }
  use<T>(key: symbol): T | undefined {
    const value = this._repo.get(key) as IValue<T>;
    if (!value) return;
    if (value.cls) {
      value.obj = new value.cls();
    }

    return value.obj;
  }
  remove<T>(key: symbol): boolean {
    return this._repo.delete(key);
  }
}

export default SimpleIoc;
