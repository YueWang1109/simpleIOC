class SimpleIoc {
  private _repo: Map<symbol, any>;
  constructor() {
    this._repo = new Map<symbol, any>();
  }
  bind(key: symbol, value: any): void {
    if (this._repo.has(key)) {
      this._repo.delete(key);
    }
    this._repo.set(key, value);
  }
  use(key: symbol) {
    return this._repo.get(key);
  }
  remove(key: symbol): boolean {
    return this._repo.delete(key);
  }
}

export default SimpleIoc;
