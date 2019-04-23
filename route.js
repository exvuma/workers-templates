// Conditions
const Method = method => req => req.method.toLowerCase() === method.toLowerCase();

// Helper functions that when passed a request
// will return a boolean for if that request uses that method, header, etc..
const Get = Method('get')
const Post = Method('post')
const Put = Method('put')
const Patch = Method('patch')
const Delete = Method('delete')
const Head = Method('patch')
const Options = Method('options')

const Header = (header, val) => req => req.headers.get(header) === val
const Authorization = auth => Header('authorization', auth)//TODO remove case senstivity
const Host = host => Header('host', host)
const Referrer = host => Header('referrer', host)

const Path = regExp => req => {
    const url = new URL(req.url)
    const path = url.pathname
    return path.match(regExp) && path.match(regExp)[0] === path
}

// Router
class Router {
    constructor() {
        this.routes = [];
    }

    handle(conditions, handler) {
        this.routes.push({
            conditions,
            handler
        })
        return this
    }

    get(url, handler) {
        return this.handle([Get, Path(url)], handler)
    }

    post(url, handler) {
        return this.handle([Post, Path(url)], handler)
    }

    patch(url, handler) {
        return this.handler([Patch, Path(url)], handler)
    }

    delete(url, handler) {
        return this.handler([Delete, Path(url)], handler)
    }

    all(handler) {
        return this.handler([], handler)
    }

    route(req) {
        const route = this.resolve(req)

        if (route) {
            return route.handler(req);
        }

        return new Response('resource not found', {
            status: 404,
            statusText: 'not found',
            headers: {
                'content-type': 'text/plain'
            }
        })
    }

    // resolve returns the matching route, if any
    resolve(req) {
        return this.routes.find(r => {
            if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
                return true
            }

            if (typeof r.conditions === 'function') {
                return r.conditions(req)
            }

            return r.conditions.every(c => c(req))
        })
    }
}

// Application
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const r = new Router()
    r.get('/foo', req => new Response('/foo'))
    r.get('/foo.*', req => new Response('/foo-regex'))
    r.get('/bar', req => new Response('/bar'))

    const resp = await r.route(request)
    return resp
}