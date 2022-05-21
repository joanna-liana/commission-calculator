import { Euro } from '../../money/Euro';
import {
  IDefaultPolicy,
  IPolicy,
} from '../../../../core/domain/policy.interface';

export interface ICommissionPolicyParams {
  money: Euro;
  date: Date;
  clientId: number;
}

export type CommissionPolicy = IPolicy<ICommissionPolicyParams, Euro>;

export type DefaultPolicy = IDefaultPolicy<ICommissionPolicyParams, Euro>;
