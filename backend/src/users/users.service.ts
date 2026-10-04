import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({email})
  }

  create(data: Pick<User, 'email' | 'name' | 'passwordHash'>): Promise<User> {
    const user = this.usersRepository.create(data)
    return this.usersRepository.save(user)
  }
}
