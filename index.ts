import "reflect-metadata";

const MY_METADATA_KEY = "myapp:paramtypes";
export type Class<I, Args extends any[] = any[]> = new (...args: Args) => I;

function Inject(type?: any): ParameterDecorator {
  return (target: any, key: string | symbol, index: number) => {
    const parameterType = Reflect.getMetadata("design:paramtypes", target, key)[
      index
    ];
    let metadata = Reflect.getMetadata(MY_METADATA_KEY, target, key) || [];
    metadata[index] = type ?? parameterType;
    Reflect.defineMetadata(MY_METADATA_KEY, metadata, target, key);
  };
}
function Req() {
  return Inject(Symbol("request"));
}

function Injectable(classMetada: any = {}): ClassDecorator {
  return (target: any) => {
    const constructorMetadata =
      Reflect.getMetadata("design:paramtypes", target) || [];
    Reflect.defineMetadata(
      MY_METADATA_KEY,
      { constructorMetadata, ...classMetada },
      target
    );
  };
}

class User {
  constructor(id?: number) {
    this.id = id || 0;
  }
  public id!: number;
}

interface Repository {
  list(): User[];
  save(user: User): void;
}

class UserRepository implements Repository {
  list() {
    return [new User(1), new User(2)];
  }
  save(user: User) {
    console.log("save", { user });
  }
}

function Controller() {
  return Injectable({ type: Symbol("controller") });
}
@Controller()
class UserController {
  constructor(protected repo: UserRepository) {
    console.log({ repo });
  }
  public listUser() {
    return this.repo.list();
  }
  public updateUser(@Inject() user: User, id: number, name: string): void {
    console.log({ name, user, id });
  }

  public test(@Req() req: any, @Inject() user: User) {
    console.log({ req, user });
  }
}

const make = <T>(target: Class<T>): T => {
  let { constructorMetadata, ...classMetadata } =
    Reflect.getMetadata(MY_METADATA_KEY, target) || {};
  console.log({ classMetadata, target });
  constructorMetadata =
    constructorMetadata?.map((token: Class<any>) => make(token)) || [];
  return new target(...constructorMetadata);
};

const call = (target: any, method: string, params: any) => {
  let injects = Reflect.getMetadata(MY_METADATA_KEY, target, method);
  injects = injects.map((i: any) =>
    i.toString().includes("class") ? make(i) : i
  );
  return target[method](...injects, ...params);
};

const user = make(UserController);
console.log(call(user, "test", [1, "akhmad"]));
