import http from 'http';
import express from 'express';
import cors from 'cors';
import { resolve } from 'path';

import { router } from './router';

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use(express.static(resolve(__dirname, '..', 'public')))
app.use(router);

server.timeout = 0;

server.listen(4000, () => console.log('rodando'));