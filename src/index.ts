/* External dependencies */
import express, { Request, Response, NextFunction } from 'express'
import https from 'https'
import morgan from 'morgan'
import helmet from 'helmet'
import hpp from 'hpp'
import dotenv from 'dotenv'
import cors from 'cors'

/* Internal dependencies */
import logger from 'logger'
import SocketIO from 'routes/socket'
import { privateKey, certificate } from '../private/ssl-config'

dotenv.config()

function runServer() {
  const options = {
    key: privateKey,
    cert: certificate,
    passphrase: process.env.SSL_PASSWORD,
  }

  const app = express()
  const server = https.createServer(options, app)
  const { PORT: port = 4000 } = process.env

  SocketIO.init(server)

  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'))
    app.use(helmet())
    app.use(hpp())
  } else {
    app.use(morgan('dev'))
  }

  app.use(cors({ origin: '*' }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(error.message)
    return res.status(error.status || 500).send(error)
  })

  server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
}

runServer()
