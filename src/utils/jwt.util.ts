import jwt from 'jsonwebtoken';

const JWT_SECRET = () => process.env.JWT_SECRET || 'nasu_backend_secret_key_2026';

export const signToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, JWT_SECRET(), { expiresIn: '30d' });
};

export const verifyToken = (token: string): { id: string; role: string } => {
  return jwt.verify(token, JWT_SECRET()) as { id: string; role: string };
};
