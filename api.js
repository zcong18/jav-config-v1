const axios = require('axios').default
const cheerio = require('cheerio')

const DEFAULT_URLS = {
  btso: 'https://btsow.club/',
  avmo: 'https://avmask.com/',
  avsox: 'https://avsox.host/',
  avmemo: 'https://avmemo.asia/',
}

const makeGetRequest = (url, timeout = 30000) => {
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
  return Promise.race(urls.map(async url => {
    console.log('valid: ', url)
    try {
      const response = await makeGetRequest(url, 30000)
      const data = response.data
      if (validFunc(data)) {
        console.log('valid done! ', url)
        return url
      }
    } catch(err) {
      console.log('valid err', url, err)
      throw err
    }
  }))
    .catch(err => {
      return defaultUrl
    })
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

const getOldConfig = async () => {
  const { data } = await makeGetRequest(`https://jav-config-v1.netlify.com/jav.json?t=${new Date().getTime()}`)

  return data
}

const getHost = u => {
  if (!u) {
    return null
  }
  const uu = new URL(u)
  return uu.hostname
}

const getAll = async () => {
  const [avmoo, avsox, avmemo, btso] = await Promise.all([
    callAvmooApi(),
    callAvsoxApi(),
    callAvmemoApi(),
    callBtsoApi(),
  ])

  console.log(111, avmoo, avsox, avmemo, btso)

  const oldConfig = await getOldConfig()
  console.log(JSON.stringify(oldConfig, null, 2))

  const newConfig = {
    latest_version: '2.4.1',
    latest_version_code: 16,
    changelog: '修复配置地址',
    btso_url: btso,
    data_sources: []
  }

  oldConfig.data_sources.forEach(s => {
    let url
    if (s.name === 'AVMOO 日本') {
      url = avmoo
    } else if (s.name === 'AVMOO 日本无码') {
      url = avsox
    } else if (s.name === 'AVMOO 欧美') {
      url = avmemo
    }

    const ds = {
      name: s.name,
      link: url,
      legacies: [
        ...s.legacies
      ]
    }
    const newUrl = url
    const oldHost = getHost(s.link)
    if (s.link !== newUrl && !ds.legacies.includes(oldHost)) {
      console.log(`add legacy url: ${oldHost}, new url: ${url}`)
      ds.legacies.push(oldHost)
    }
    newConfig.data_sources.push(ds)
  })

  console.log(JSON.stringify(newConfig, null, 2))

  return newConfig
}

// callAvsoxApi()
//   .then(console.log)

module.exports = {
  getAll
}
