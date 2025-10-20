export function workerTemplate({ accessDomain, targetDomain, fallbackDomain }: { accessDomain: string; targetDomain: string; fallbackDomain?: string }) {
  let code = `addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    const url = new URL(request.url)
    // 将访问域名替换为目标域名
    const host = url.hostname
    if (host === '访问域名') {
      url.hostname = '目标域名'
    }

    const newRequest = new Request(url.toString(), request)
    const resp = await fetch(newRequest)
    return new Response(resp.body, resp)
  } catch (err) {
    // 备用域名回退
    try {
      const url = new URL(request.url)
      url.hostname = '备用'
      return await fetch(new Request(url.toString(), request))
    } catch (e) {
      return new Response('Worker 错误', { status: 500 })
    }
  }
}`;
  code = code.replaceAll('访问域名', accessDomain).replaceAll('目标域名', targetDomain)
  if (fallbackDomain) {
    code = code.replaceAll('备用', fallbackDomain)
  }
  return code
}
