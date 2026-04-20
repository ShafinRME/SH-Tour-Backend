/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express"
import { z } from "zod"

export const validateRequest = <T extends z.ZodType<unknown>>(zodSchema: T) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            if (req.body?.data) {
                req.body = JSON.parse(req.body.data)
            }

            await zodSchema.parseAsync({ body: req.body })
            next()
        } catch (error) {
            next(error)
        }
    }