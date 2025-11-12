import { Router } from 'express'
import { authRouter } from '../modules/auth'
import { userRouter } from '../modules/users'
import { sessionRouter } from '../modules/sessions'
import { authGuard } from '../middlewares/authGuard'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/users', authGuard, userRouter)
apiRouter.use('/sessions', authGuard, sessionRouter)

