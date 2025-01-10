import 'dotenv/config'
import { DataSource } from 'typeorm'
import * as path from 'path'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

const { DB_DATABASE, DB_PORT, DB_PASSWORD, DB_HOST, DB_USER } = process.env

const appDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  logging: ['error'],
  entities: [path.join(__dirname, 'entity/*{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*.js')],
  namingStrategy: new SnakeNamingStrategy(),
})

appDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err)
  })

export default appDataSource
