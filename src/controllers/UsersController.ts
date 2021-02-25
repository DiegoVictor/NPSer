import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import UsersRepository from '../repositories/UsersRepository';

class UsersController {
  async store(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;
    const usersRepository = getCustomRepository(UsersRepository);

    const userAlreadyExists = await usersRepository.findOne({
      email,
    });
    if (userAlreadyExists) {
      throw badRequest('User already exists', { code: 140 });
    }

    const user = usersRepository.create({ name, email });
    await usersRepository.save(user);

    return response.status(201).json(user);
  }
}

export default UsersController;
