/** 
 * serveRawHtml delievers a response with HTML inputted directly into the worker script
*/
async function serveRawHtml(request) {
    const someHTML = `
   <!DOCTYPE html>
    <html>
    <body>

    <h1>Hello World</h1>
    <p>This is all generated using a Worker</p>
     <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

    </body>
    </html>
    `
    const init = {
        headers: {
            'content-type': 'text/html;charset=UTF-8'
        }
    }
    return new Response(someHTML, init)
}
/** 
 * serveFromCloudStorage takes in a request from the path /cloud-storage/someresource 
 * and then fetches someresource or /index.html from a digital ocean space
*/
async function serveFromCloudStorage(request) {
    const parsedUrl = new URL(request.url)
    let path = parsedUrl.pathname
    path = parsedUrl.pathname.replace("/cloud-storage", "")
    let lastSegment = path.substring(path.lastIndexOf('/'))
    console.log(lastSegment)
    if (lastSegment.indexOf('.') === -1) {
        path += '/index.html'
    }
    console.log(path)
    return fetch("https://cloudflare-example-space.nyc3.digitaloceanspaces.com" + path)
}

addEventListener('fetch', event => {
    const url = event.request.url
    // Replace with the routes you wish to serve static resources from 
    if (url.includes('/cloud-storage')) return event.respondWith(serveFromCloudStorage(event.request))
    if (url.endsWith('/raw')) return event.respondWith(serveRawHtml(event.request))
    event.respondWith(new Response("not-found", { status: 404 }))
})