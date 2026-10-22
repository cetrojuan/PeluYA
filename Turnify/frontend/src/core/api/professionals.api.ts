import { request } from './http';
import type { BusinessInput, ProfessionalProfile, PublicProfessional } from '../models/types';

export const professionalsApi = {
  list: () => request<PublicProfessional[]>('/professionals'),
  updateMyBusiness: (input: BusinessInput) => request<ProfessionalProfile>('/professional', 'PUT', input),
};
