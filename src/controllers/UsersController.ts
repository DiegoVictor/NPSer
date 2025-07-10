import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../repositories/UsersRepository';

class UsersController {
  async store(request: Request, response: Response): Promise<void> {
    const { name, email } = request.body;

    const userAlreadyExists = await UsersRepository.findOne({
      where: {
        email,
      },
    });
    if (userAlreadyExists) {
      throw badRequest('User already exists', { code: 140 });
    }

    const user = UsersRepository.create({ id: uuid(), name, email });
    await UsersRepository.save(user);

    response.status(201).json(user);
  }
}

export { UsersController };
