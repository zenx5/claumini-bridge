import { Router } from "express";
import { integrationQuery, single } from "../controller/integration.ts";

export default function generateRouter(bridgeContext:any){
    const router = Router()

    router.get('/info', (req, res) => res.send('Claumini Bridge is running'))

    router.post('/api/ask', single(bridgeContext))

    router.post(['/v1/chat/completions', '/v1', '/chat/completions', '/api/chat'],integrationQuery(bridgeContext))

    return router
}


