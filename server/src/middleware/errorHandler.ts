import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface MongoDuplicateKeyError {
  code: number;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is MongoDuplicateKeyError {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (isDuplicateKeyError(err)) {
    const [field, value] = Object.entries(err.keyValue ?? {})[0] ?? ['field', 'value'];
    res.status(409).json({ message: `That ${field} ("${value}") is already in use.` });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
