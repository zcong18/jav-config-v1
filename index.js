const fs = require('fs')
const { getAll } = require('./api')

const run = async () => {
  const config = await getAll()
  fs.writeFileSync('./public/jav.json', JSON.stringify(config))
}

run()
