import SimpleIoc from "./simple-ioc";

describe("Simple IoC tests", () => {
  let container: SimpleIoc;
  const testKey = Symbol.for("test");

  class TestClass {
    count = 0;
    sayHi() {
      return `Hello, world! count = ${this.count++}`;
    }
  }

  beforeEach(() => {
    container = new SimpleIoc();
  });
  describe("register dependencies", () => {
    it("bind objects", () => {
      container.bind(testKey, {name: "Alex", age: 28});
      expect(container.use(testKey)?.name).toEqual("Alex");
      expect(container.use(testKey)?.age).toEqual(28);
    });
    it("rebind objects", () => {
      container.bind(testKey, {name: "Alex", age: 28});
      expect(container.use(testKey)?.name).toEqual("Alex");
      expect(container.use(testKey)?.age).toEqual(28);

      container.bind(testKey, {name: "bob", age: 35});
      expect(container.use(testKey)?.name).toEqual("bob");
      expect(container.use(testKey)?.age).toEqual(35);
    });

    it("bind class", () => {
      container.bind(testKey, new TestClass());
      expect(container.use(testKey)?.sayHi()).toEqual("Hello, world! count = 0");
      expect(container.use(testKey)?.sayHi()).toEqual("Hello, world! count = 1");
      expect(container.use(testKey)?.sayHi()).toEqual("Hello, world! count = 2");
    });
  });

  describe("remove dependencies", () => {
    it("remove objects", () => {
      container.bind(testKey, {name: "Alex", age: 28});
      expect(container.use(testKey)?.name).toEqual("Alex");
      expect(container.use(testKey)?.age).toEqual(28);

      expect(container.remove(testKey)).toBe(true);
      expect(container.use(testKey)).toBeUndefined();
      expect(container.remove(testKey)).toBe(false);
    });

    it("remove class", () => {
      container.bind(testKey, new TestClass());
      expect(container.use(testKey)?.sayHi()).toEqual("Hello, world! count = 0");
      expect(container.use(testKey)?.sayHi()).toEqual("Hello, world! count = 1");
      expect(container.use(testKey)?.sayHi()).toEqual("Hello, world! count = 2");

      expect(container.remove(testKey)).toBe(true);
      expect(container.use(testKey)).toBeUndefined();
      expect(container.remove(testKey)).toBe(false);
    });
  });
});
