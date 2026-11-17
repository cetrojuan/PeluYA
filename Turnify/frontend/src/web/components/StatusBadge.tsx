import type { AppointmentStatus } from '@/core/models/types';
import { STATUS_LABELS } from '@/core/utils/format';

export const StatusBadge = ({ status }: { status: AppointmentStatus }) => (
  <span className={'status ' + status}>{STATUS_LABELS[status]}</span>
);
