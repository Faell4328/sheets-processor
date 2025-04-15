import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { resolve } from 'path';
import { exec } from 'child_process';

import multerConfig from './config/multer';

const router = Router();

const upload = multer(multerConfig.upload());

router.get('/', (req: Request, res: Response) => {
    res.send("Opa! Tá rodando");
});

router.post('/', upload.single('file'), (req: Request, res: Response) => {
    if(!req.file){
        res.send('arquivo não enviado');
    }
    else{
        const { originalname, filename } = req.file;
        const audiverisCommmand = `docker run -t --rm -v "$(pwd)/public/arquivos:/arquivos" audiveris-container --args="-batch /arquivos/${filename} -export -output /arquivos"`;

        console.log('preparando')
        exec(audiverisCommmand, (err, stdout, stderr) => {
            if(err){
                console.error('Erro ao executar Audiveris:', stderr);
                return res.status(500).send('Erro ao processar o arquivo');
              }
            console.log('Audiveris finalizado: ',stdout);
            const localOutputDir = resolve(__dirname, '..', 'public', 'arquivos');
            const files = fs.readdirSync(localOutputDir).filter(file=>
                file.endsWith('.mxl') || file.endsWith('.xml')
            )

            const arquivoProcessado = filename.replace('.pdf', '.mxl');
            console.log(arquivoProcessado);
            res.send("http://localhost:3000/arquivos/"+arquivoProcessado);
        })
    }
});

// router.all(/.*/, (req: Request, res: Response) => {
//     res.status(404).json({ status: 0, mensagem: 'Rota não encontrada' });
// });


export { router };