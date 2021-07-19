import SimpleIoc from "./simple-ioc";

describe("Simple IoC tests", () => {
  let container: SimpleIoc;

  const TYPE = {
    myKey: Symbol.for("example"),
    circular1: Symbol.for("circular1"),
    circular2: Symbol.for("circular2"),
    circular3: Symbol.for("circular3"),
    circular4: Symbol.for("circular4"),
  };

  interface ObjType {
    name: string;
    age: number;
  }

  interface ClassType {
    count: number;
    sayHi: () => string;
  }

  class TestClass implements ClassType {
    count = 0;
    sayHi() {
      return `Hello, world! count = ${this.count++}`;
    }
  }

  class Circular1 {
    subTitle: string | undefined;
    constructor(public title: string = "circular1") {
      this.subTitle = container.use<Circular2>(TYPE.circular2)?.title;
    }
  }
  class Circular2 {
    subTitle: string | undefined;
    constructor(public title: string = "circular2") {
      this.subTitle = container.use<Circular1>(TYPE.circular1)?.title;
    }
  }

  class Circular3 {
    subTitle: string | undefined;
    constructor(public title: string = "circular3") {}
    fillTitle() {
      this.subTitle = container.use<Circular4>(TYPE.circular4)?.title;
      return this;
    }
  }
  class Circular4 {
    subTitle: string | undefined;
    constructor(public title: string = "circular4") {}
    fillTitle() {
      this.subTitle = container.use<Circular3>(TYPE.circular3)?.title;
      return this;
    }
  }
  beforeEach(() => {
    container = new SimpleIoc();
  });
  describe("register dependencies", () => {
    it("bind number type", () => {
      container.bindObject<number>(TYPE.myKey, 123);
      expect(container.use<number>(TYPE.myKey)).toBe(123);
    });
    it("bind array type", () => {
      container.bindObject<string[]>(TYPE.myKey, ["this", "is", "an", "array"]);
      expect(container.use<string[]>(TYPE.myKey)).toEqual(["this", "is", "an", "array"]);
    });
    it("bind objects", () => {
      container.bindObject<ObjType>(TYPE.myKey, {name: "Alex", age: 28});
      expect(container.use<ObjType>(TYPE.myKey)?.name).toEqual("Alex");
      expect(container.use<ObjType>(TYPE.myKey)?.age).toEqual(28);
    });
    it("rebind objects", () => {
      container.bindObject<ObjType>(TYPE.myKey, {name: "Alex", age: 28});
      expect(container.use<ObjType>(TYPE.myKey)?.name).toEqual("Alex");
      expect(container.use<ObjType>(TYPE.myKey)?.age).toEqual(28);

      container.bindObject<ObjType>(TYPE.myKey, {name: "bob", age: 35});
      expect(container.use<ObjType>(TYPE.myKey)?.name).toEqual("bob");
      expect(container.use<ObjType>(TYPE.myKey)?.age).toEqual(35);
    });

    it("bind class with singleton", () => {
      container.bindClass<ClassType>(TYPE.myKey, TestClass, true);
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 0");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 1");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 2");
    });

    it("rebind class with singleton", () => {
      container.bindClass<ClassType>(TYPE.myKey, TestClass, true);
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 0");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 1");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 2");
      container.bindClass<ClassType>(TYPE.myKey, TestClass, true);
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 0");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 1");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 2");
    });

    it("bind class without singleton", () => {
      container.bindClass<ClassType>(TYPE.myKey, TestClass, false);
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 0");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 0");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 0");
    });
  });

  describe("remove dependencies", () => {
    it("remove objects", () => {
      container.bindObject<ObjType>(TYPE.myKey, {name: "Alex", age: 28});
      expect(container.use<ObjType>(TYPE.myKey)?.name).toEqual("Alex");
      expect(container.use<ObjType>(TYPE.myKey)?.age).toEqual(28);

      expect(container.remove(TYPE.myKey)).toBe(true);
      expect(container.use<ObjType>(TYPE.myKey)).toBeUndefined();
      expect(container.remove(TYPE.myKey)).toBe(false);
    });

    it("remove class", () => {
      container.bindClass<ClassType>(TYPE.myKey, TestClass);
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 0");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 1");
      expect(container.use<ClassType>(TYPE.myKey)?.sayHi()).toEqual("Hello, world! count = 2");

      expect(container.remove(TYPE.myKey)).toBe(true);
      expect(container.use<ObjType>(TYPE.myKey)).toBeUndefined();
      expect(container.remove(TYPE.myKey)).toBe(false);
    });
  });

  describe("circular dependency", () => {
    it("circular dependencies when construct (singleton)", () => {
      container.bindClass<Circular1>(TYPE.circular1, Circular1);
      container.bindClass<Circular2>(TYPE.circular2, Circular2);
      expect(() => container.use<Circular1>(TYPE.circular1)).toThrow("circular dependencies detected");
    });
    it("circular dependencies when construct (not singleton)", () => {
      container.bindClass<Circular1>(TYPE.circular1, Circular1, false);
      container.bindClass<Circular2>(TYPE.circular2, Circular2, false);
      expect(() => container.use<Circular1>(TYPE.circular1)).toThrow("circular dependencies detected");
    });

    it("circular dependencies after constructed (singleton)", () => {
      container.bindClass<Circular3>(TYPE.circular3, Circular3);
      container.bindClass<Circular4>(TYPE.circular4, Circular4);
      expect(container.use<Circular3>(TYPE.circular3)?.fillTitle().subTitle).toEqual("circular4");
      expect(container.use<Circular4>(TYPE.circular4)?.fillTitle().subTitle).toEqual("circular3");
    });
    it("circular dependencies after constructed (not singleton)", () => {
      container.bindClass<Circular3>(TYPE.circular3, Circular3, false);
      container.bindClass<Circular4>(TYPE.circular4, Circular4, false);
      expect(container.use<Circular3>(TYPE.circular3)?.fillTitle().subTitle).toEqual("circular4");
      expect(container.use<Circular4>(TYPE.circular4)?.fillTitle().subTitle).toEqual("circular3");
    });
  });
});
