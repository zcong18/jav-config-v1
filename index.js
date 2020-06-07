const fs = require('fs')
const { getAll } = require('./api2')

const run = async () => {
  const config = await getAll()
  fs.writeFileSync('./public/jav.json', JSON.stringify(config))
}

run()

if (!fs.existsSync('./public/jav.json')) {
  console.log('./public/jav.json not exists')
  process.exit(1)
}
