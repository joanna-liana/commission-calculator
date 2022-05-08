import { Module } from '@nestjs/common';
import { CommissionModule } from './commission/commission.module';

@Module({
  imports: [CommissionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
