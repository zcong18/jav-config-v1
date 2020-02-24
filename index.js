const fs = require('fs')
const { getAll } = require('./api')

const run = async () => {
  const config = await getAll()
  fs.writeFileSync('./config/jav.json', JSON.stringify(config))
}

run()
