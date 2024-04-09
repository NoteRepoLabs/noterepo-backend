import { FastifyReply, FastifyRequest } from 'fastify';
import * as morgan from 'morgan';
import 'colors';

morgan.token('method', (req: FastifyRequest) => {
  switch (req.method) {
    case 'POST':
      return req.method.yellow;
    case 'PUT':
      return req.method.blue;
    case 'DELETE':
      return req.method.red;
    default:
      return req.method.green;
  }
});

morgan.token('status', (_: FastifyRequest, res: FastifyReply) => {
  if (res.statusCode >= 500) {
    return `${res.statusCode}`.red;
  } else if (res.statusCode >= 400) {
    return `${res.statusCode}`.yellow;
  } else if (res.statusCode >= 300) {
    return `${res.statusCode}`.cyan;
  } else {
    return `${res.statusCode}`.green;
  }
});

export const logger = () =>
  morgan(
    '\n:method\t [:date] :url\t :status\t :response-time ms - :res[content-length]',
  );
