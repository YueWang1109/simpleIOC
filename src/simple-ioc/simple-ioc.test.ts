import SimpleIoc from "./simple-ioc";

describe("Simple IoC tests", () => {
  let container: SimpleIoc;

  const myKey = Symbol.for("example");

  interface ObjType {
    name: string;
    age: number;
  }

  interface ClassType {
    sayHi: () => string;
  }

  class TestClass implements ClassType {
    sayHi() {
      return `Hello, world!`;
    }
  }

  beforeEach(() => {
    container = new SimpleIoc();
  });
  describe("register dependencies", () => {
    it("bind objects", () => {
      container.bindObject<ObjType>(myKey, {name: "Alex", age: 28});
      expect(container.use<ObjType>(myKey)?.name).toEqual("Alex");
      expect(container.use<ObjType>(myKey)?.age).toEqual(28);
    });
    it("rebind objects", () => {
      container.bindObject<ObjType>(myKey, {name: "Alex", age: 28});
      expect(container.use<ObjType>(myKey)?.name).toEqual("Alex");
      expect(container.use<ObjType>(myKey)?.age).toEqual(28);

      container.bindObject<ObjType>(myKey, {name: "bob", age: 35});
      expect(container.use<ObjType>(myKey)?.name).toEqual("bob");
      expect(container.use<ObjType>(myKey)?.age).toEqual(35);
    });

    it("bind class", () => {
      container.bindClass<ClassType>(myKey, TestClass, true);
      expect(container.use<ClassType>(myKey)?.sayHi()).toEqual("Hello, world!");
    });
  });

  describe("remove dependencies", () => {
    it("remove objects", () => {
      container.bindObject<ObjType>(myKey, {name: "Alex", age: 28});
      expect(container.use<ObjType>(myKey)?.name).toEqual("Alex");
      expect(container.use<ObjType>(myKey)?.age).toEqual(28);

      expect(container.remove(myKey)).toBe(true);
      expect(container.use<ObjType>(myKey)).toBeUndefined();
      expect(container.remove(myKey)).toBe(false);
    });

    it("remove class", () => {
      container.bindClass<ClassType>(myKey, TestClass);
      expect(container.use<ClassType>(myKey)?.sayHi()).toEqual("Hello, world!");

      expect(container.remove(myKey)).toBe(true);
      expect(container.use<ObjType>(myKey)).toBeUndefined();
      expect(container.remove(myKey)).toBe(false);
    });
  });
});
