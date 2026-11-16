import { request } from './http';
import type { BusinessInput, Paginated, ProfessionalProfile, PublicProfessional } from '../models/types';

export const professionalsApi = {
  list: (page = 1, q = '') => request<Paginated<PublicProfessional>>(
    `/professionals?page=${page}&q=${encodeURIComponent(q)}`),
  updateMyBusiness: (input: BusinessInput) => request<ProfessionalProfile>('/professional', 'PUT', input),
};
