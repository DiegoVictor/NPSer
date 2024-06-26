import { badRequest } from '@hapi/boom';
import { Request, Response } from 'express';
import { UsersRepository } from '../repositories/UsersRepository';

class UsersController {
  async store(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;

    const userAlreadyExists = await UsersRepository.findOne({
      where: {
        email,
      },
    });
    if (userAlreadyExists) {
      throw badRequest('User already exists', { code: 140 });
    }

    const user = UsersRepository.create({ name, email });
    await UsersRepository.save(user);

    return response.status(201).json(user);
  }
}

export { UsersController };
