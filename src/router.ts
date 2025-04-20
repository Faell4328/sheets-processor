import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { resolve } from 'path';
import { exec } from 'child_process';
import multerConfig from './config/multer';
import authenticationMiddleware from './middleware';

const router = Router();
const upload = multer(multerConfig.upload());

router.get('/', authenticationMiddleware, (req: Request, res: Response) => {
  res.send("Opa! Tá rodando");
});

router.post('/', authenticationMiddleware, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('Arquivo não enviado');
  }

  console.log('Está iniciando o audiveris')

  const { filename } = req.file;
  const audiverisCommand = `docker run -t --rm -v "$(pwd)/public/arquivos:/arquivos" faell4328/audiveris-container:tagname --args="-batch /arquivos/${filename} -export -output /arquivos"`;

  console.log('Executando Audiveris...');

  exec(audiverisCommand, async (err, stdout, stderr) => {
    if (err) {
      console.error('Erro ao executar Audiveris:', stderr);
      return res.status(500).send('Erro ao processar o arquivo');
    }

    console.log('Audiveris finalizado:', stdout);

    const arquivoProcessado = filename.replace(/\.pdf$/i, '.mxl');
    const caminhoMXL = resolve(process.cwd(), 'public', 'arquivos', arquivoProcessado);
    const pastaArquivos = resolve(process.cwd(), 'public');
    const pastaArquivosCompleta = resolve(process.cwd(), 'public', 'arquivos');

    try {
      const buffer = await fs.promises.readFile(caminhoMXL);
      console.log('Arquivo .mxl lido com sucesso');

      res.setHeader('Content-Type', 'application/vnd.recordare.musicxml');
      res.send(buffer);

      // Apagar a pasta inteira após envio
      res.on('finish', async () => {
        try {
          await fs.promises.rm(pastaArquivos, { recursive: true, force: true });
          console.log('Pasta "public/arquivos" deletada com sucesso.');
          await fs.promises.mkdir(pastaArquivosCompleta, { recursive: true });
          console.log('Pasta "public/arquivos" criada com sucesso.');
        } catch (cleanupError) {
          console.error('Erro ao deletar a pasta:', cleanupError);
        }
      });

    } catch (error) {
      console.error('Erro ao ler o arquivo .mxl:', error);
      return res.status(500).send('Arquivo MXL não encontrado');
    }
  });
});

export { router };
