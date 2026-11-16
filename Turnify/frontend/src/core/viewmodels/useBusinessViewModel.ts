import { professionalsApi } from '../api';
import type { BusinessInput } from '../models/types';
import { PAYMENT_METHODS } from '../utils/format';
import { useApp } from './AppContext';

export function useBusinessViewModel() {
  const { profile, pending, run, mutate } = useApp();
  const business = profile!.professional!;
  const acceptedMethods = business.paymentMethods.split(',');
  const save = (input: BusinessInput) => run(() => mutate(() => professionalsApi.updateMyBusiness(input)));
  return { business, paymentMethods: PAYMENT_METHODS, acceptedMethods, pending, save };
}
