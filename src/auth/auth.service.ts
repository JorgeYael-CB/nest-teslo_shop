import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {compareSync, hashSync} from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}


    private handleError( error:any ):never {
      if( error.code && Number(error.code) && Number(error.code) === 23505 ){
        throw new BadRequestException(error.detail)
      };

      console.log(error);
      throw new InternalServerErrorException(`Internal server Error, check logs!`);
    };


    async create(createUserDto: CreateUserDto) {
      const { password, ...userData } = createUserDto;

      try {
        const user = this.userRepository.create({
          ...userData,
          password: hashSync(password, 10),
        });
        await this.userRepository.save(user);
        delete user.password;

        // TODO: JWT

        return user;
      } catch (error) {
        this.handleError(error);
      }
  }


  async login( loginUserDto: LoginUserDto ) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {email: true, password: true},
    });

    if( !user || !compareSync(password, user.password) ){
      throw new UnauthorizedException(`Credentials are not valid`);
    };

    // TODO: JWT

    return user;
  }

};
