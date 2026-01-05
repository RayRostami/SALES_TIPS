import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './material.entity';
import { MaterialCategory } from './material-category.entity';
import { Unit } from './unit.entity';
import { MaterialUnit } from './material-unit.entity';
import { MaterialsService } from './material.service';
import { MaterialsController } from './material.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '120m' },
      }),
    }),
    TypeOrmModule.forFeature([Material, MaterialCategory, Unit, MaterialUnit]),
  ],
  providers: [MaterialsService],
  controllers: [MaterialsController],
})
export class MaterialsModule {}
