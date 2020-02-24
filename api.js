const axios = require('axios').default
const cheerio = require('cheerio')

const DEFAULT_URLS = {
  btso: 'https://btsow.club/',
  avmo: 'https://avmask.com/',
  avsox: 'https://avsox.host/',
  avmemo: 'https://avmemo.asia/',
}

const createInstance = (endpoint, timeout = 5000) => axios.create({
  baseURL: endpoint,
  timeout,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6'
  }
})

const makeGetRequest = (url, timeout = 5000) => {
  const source = axios.CancelToken.source()
  setTimeout(() => source.cancel(), timeout)
  return axios.get(url, {
    cancelToken: source.token,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6'
    }
  })
}

const getUrls = async (url, elClass) => {
  console.log(url)
  const response = await makeGetRequest(url)
  const data = response.data
  const $ = cheerio.load(data)
  const urls = $(elClass)
    .map((_, el) => {
      const e = $(el).find('a')
      return e.attr().href
    })
    .get()

  return urls
}

const getValidUrl = async (urls, validFunc, defaultUrl) => {
  if (urls.length === 0) {
    return defaultUrl
  }
  for (const url of urls) {
    console.log('valid: ', url)
    try {
      const response = await makeGetRequest(url, 5000)
      const data = response.data
      console.log('valid done! ', url)
      if (validFunc(data)) {
        return url
      }
    } catch(err) {
      console.log('valid err', err)
    }
  }
  return defaultUrl
}

const callBtsoApi = async () => {
  try {
    const urls = await getUrls('https://tellme.pw/btsow', 'h2')
    return getValidUrl(
      urls,
      data => /Select \.torrent file/.test(data),
      DEFAULT_URLS['btso'],
    )
  } catch (err) {
    console.log(err)
    return DEFAULT_URLS['btso']
  }
}

const callAvmooApi = async () => {
  try {
    const urls = await getUrls('https://tellme.pw/avmo', 'h4')
    return getValidUrl(
      urls,
      data => /简体中文/.test(data),
      DEFAULT_URLS['avmo'],
    )
  } catch (err) {
    console.log(err)
    return DEFAULT_URLS['avmo']
  }
}

const callAvsoxApi = async () => {
  try {
    const urls = await getUrls('https://tellme.pw/avsox', 'h4')
    return getValidUrl(
      urls,
      data => /简体中文/.test(data),
      DEFAULT_URLS['avsox'],
    )
  } catch (err) {
    console.log(err)
    return DEFAULT_URLS['avsox']
  }
}

const callAvmemoApi = async () => {
  try {
    const urls = await getUrls('https://tellme.pw/avmemo', 'h4')
    return getValidUrl(
      urls,
      data => /简体中文/.test(data),
      DEFAULT_URLS['avmemo'],
    )
  } catch (err) {
    console.log(err)
    return DEFAULT_URLS['avmemo']
  }
}

const getAll = async () => {
  const [avmoo, avsox, avmemo, btso] = await Promise.all([
    callAvmooApi(),
    callAvsoxApi(),
    callAvmemoApi(),
    callBtsoApi(),
  ])

  return {
    latest_version: '2.2.8',
    latest_version_code: 13,
    changelog: '更新配置地址\nbtso 地址使用网络地址',
    btso_url: btso,
    data_sources: [
      {
        name: 'AVMOO 日本',
        link: avmoo,
        legacies: [
          'javzoo.com',
          'avmoo.xyz',
          'avmoo.net',
          'avmoo.pw',
          'javmoo.com',
          'javlog.com',
          'javtag.com',
          'javhip.com',
          'avos.pw',
          'avmo.pw',
          'avmo.club',
          'avio.pw',
          'javdog.com',
          'javmoo.net',
        ],
      },
      {
        name: 'AVMOO 日本无码',
        link: avsox,
        legacies: [
          'avme.pw',
          'avsox.net',
          'javkey.com',
          'javfee.com',
          'javpee.com',
          'avso.pw',
          'avso.club',
        ],
      },
      {
        name: 'AVMOO 欧美',
        link: avmemo,
        legacies: [],
      },
    ],
  }
}

module.exports = {
  getAll
}
