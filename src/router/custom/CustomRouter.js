import { Router } from "express";

export default class CustomRouter {
    constructor({ mergeParams = true, base = '' } = {}) {
        this.base = base;
        this.router = Router({ mergeParams });

        this.params = this.router.param.bind(this.router);
    }

    _wrap(fn) {
        if (typeof fn !== 'function') return fn; // Si no es una función, devuelvo lo que sea (puede ser un middleware o cualquier otra cosa)
        return function wrapped(req, res, next) {
            try {
                const result = fn(req, res, next);
                if (result && typeof result.then === 'function') { // Si es una promesa, manejo el error con catch
                    result.catch(next);
                }
            } catch (err) {
                next(err);
            }
        };
    }
    use(...args) { this.router.use(...args); }

    get(path, ...handlers) { this.router.get(this.base + path, ...handlers.map(h => this._wrap(h))); }
    post(path, ...handlers) { this.router.post(this.base + path, ...handlers.map(h => this._wrap(h))); }
    put(path, ...handlers) { this.router.put(this.base + path, ...handlers.map(h => this._wrap(h))); }
    delete(path, ...handlers) { this.router.delete(this.base + path, ...handlers.map(h => this._wrap(h))); }

    // Helper para asegurar rutas con prefijo (subrouters)
    group(prefix, buildfn) {
        const subRouter = new CustomRouter();
        buildfn(subRouter);
        this.router.use(prefix, subRouter.router);
    }
}