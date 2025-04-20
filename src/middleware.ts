import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();  // Carrega o arquivo .env

const authenticationMiddleware = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'A chave secreta é necessária' }).end();
  }

  const token = authHeader.split(' ')[1]; // Caso o token seja enviado como 'Bearer <token>'

  if (token !== process.env.SECRET_KEY) {
    return res.status(403).json({ message: 'Chave secreta inválida' }).end();
  }

  // Se o token for válido, continua para a próxima parte do middleware ou a rota
  next(); // Chama o próximo middleware ou a rota
};

export default authenticationMiddleware;
