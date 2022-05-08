import { Body, Controller, Post } from '@nestjs/common';
import { Money } from '../../domain/money/Money';
import { CalculateCommissionUseCase } from '../calculate-commission.usecase';
import { ClientId } from './params/ClientId';
import { CommissionRequestDto } from './requests/commission-request.dto';
import { CommissionResponseDto } from './responses/commission-response.dto';

@Controller('commissions')
export class CommissionController {
  constructor(private calculateCommissionUseCase: CalculateCommissionUseCase) {}

  @Post()
  async create(
    @ClientId() clientId: number,
    @Body() { amount, currency, date }: CommissionRequestDto,
  ) {
    const commission = await this.calculateCommissionUseCase.execute({
      money: Money.of(amount, currency),
      date,
      clientId,
    });

    return CommissionResponseDto.fromEUR(commission);
  }
}
