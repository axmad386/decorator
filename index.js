"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const MY_METADATA_KEY = "myapp:paramtypes";
function Inject(type) {
    return (target, key, index) => {
        const parameterType = Reflect.getMetadata("design:paramtypes", target, key)[index];
        let metadata = Reflect.getMetadata(MY_METADATA_KEY, target, key) || [];
        metadata[index] = type ?? parameterType;
        Reflect.defineMetadata(MY_METADATA_KEY, metadata, target, key);
    };
}
function Req() {
    return Inject(Symbol("request"));
}
function Injectable(classMetada = {}) {
    return (target) => {
        const constructorMetadata = Reflect.getMetadata("design:paramtypes", target) || [];
        Reflect.defineMetadata(MY_METADATA_KEY, { constructorMetadata, ...classMetada }, target);
    };
}
class User {
    constructor(id) {
        this.id = id || 0;
    }
    id;
}
class UserRepository {
    list() {
        return [new User(1), new User(2)];
    }
    save(user) {
        console.log("save", { user });
    }
}
function Controller() {
    return Injectable({ type: Symbol("controller") });
}
let UserController = class UserController {
    repo;
    constructor(repo) {
        this.repo = repo;
        console.log({ repo });
    }
    listUser() {
        return this.repo.list();
    }
    updateUser(user, id, name) {
        console.log({ name, user, id });
    }
    test(req, user) {
        console.log({ req, user });
    }
};
__decorate([
    __param(0, Inject()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User, Number, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateUser", null);
__decorate([
    __param(0, Req()),
    __param(1, Inject()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, User]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "test", null);
UserController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [UserRepository])
], UserController);
const make = (target) => {
    let { constructorMetadata, ...classMetadata } = Reflect.getMetadata(MY_METADATA_KEY, target) || {};
    console.log({ classMetadata, target });
    constructorMetadata =
        constructorMetadata?.map((token) => make(token)) || [];
    return new target(...constructorMetadata);
};
const call = (target, method, params) => {
    let injects = Reflect.getMetadata(MY_METADATA_KEY, target, method);
    console.log({ injects });
    injects = injects.map((i) => i.toString().includes("class") ? make(i) : i);
    return target[method](...injects, ...params);
};
const user = make(UserController);
console.log(call(user, "test", [1, "akhmad"]));
