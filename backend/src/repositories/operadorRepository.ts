import { db } from '../config/database';
import { Operador } from '../types';

export const operadorRepository = {
  async findByEmail(email: string): Promise<Operador | undefined> {
    return db('operadores').where({ email }).first();
  },

  async findById(id: number): Promise<Operador | undefined> {
    return db('operadores').where({ id }).first();
  },
};
