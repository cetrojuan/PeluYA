import { useState } from 'react';
import { servicesApi } from '../api';
import type { Service, ServiceInput } from '../models/types';
import { useApp } from './AppContext';

export function useServicesViewModel() {
  const { profile, pending, run, mutate } = useApp();
  const [editing, setEditing] = useState<Service | null>(null);

  const save = (input: ServiceInput) =>
    run(async () => {
      await mutate(() => (editing ? servicesApi.update(editing.id, input) : servicesApi.create(input)));
      setEditing(null);
    });

  const remove = (id: string) => run(() => mutate(() => servicesApi.remove(id)), 'Servicio retirado');

  return {
    services: profile!.professional!.services,
    editing,
    startEditing: setEditing,
    cancelEditing: () => setEditing(null),
    pending,
    save,
    remove,
  };
}
