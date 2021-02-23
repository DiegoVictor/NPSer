import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import User from '../models/User';

class UserController {
  async create(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;
    const usersRepository = getRepository(User);

    const userAlreadyExists = usersRepository.findOne({
      email,
    });

    if (userAlreadyExists) {
      return response.status(400).json({
        message: 'User already exists!',
      });
    }

    const user = usersRepository.create({ name, email });
    await usersRepository.save(user);

    return response.sendStatus(204);
  }
}

export default UserController;
