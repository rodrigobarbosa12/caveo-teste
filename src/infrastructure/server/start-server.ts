import 'dotenv/config'
import 'module-alias/register';
import app from './start-config'
import * as ip from 'ip'

const { PORT_SERVER } = process.env

app.listen(PORT_SERVER, () => {
  console.log(`Server running in: http://${ip.address()}:${PORT_SERVER}`)
})
