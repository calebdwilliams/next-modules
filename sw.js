function isModuleType(type) {
  return event.request.destination === 'script' && event.request.url.endsWith(`.${type}`);
}

function modifyHeaders(headers) {
  headers.set('content-type', 'application/javascript');
  headers.delete('content-length');
  return headers;
}

addEventListener("install", () => {
  self.skipWaiting();
});

addEventListener("activate", e => {
  clients.claim();
});

addEventListener("fetch", event => {
  if (isModuleType('css')) {
    let response;
    event.respondWith(
      fetch(event.request)
        .then(res => (response = res).text())
        .then(css => {
          const headers = modifyHeaders(response.headers);
          return new Response(
            `const sheet = new CSSStyleSheet();sheet.replace(\`${css}\`);export default sheet;`,
            { headers }
          );
        })
    );
  } else if (isModuleType('html')) {
    let response;
    event.respondWith(
      fetch(event.request)
        .then(res => (response = res).text())
        .then(html => {
          const headers = modifyHeaders(response.headers);
          return new Response(
            `const template = document.createElement('template');
            template.innerHTML = \`${html}\`;
            export default template;`,
            { headers }
          );
        })
    );
  }
});
