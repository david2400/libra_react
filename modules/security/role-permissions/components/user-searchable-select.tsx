'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { RiLoader2Line, RiUserLine } from 'react-icons/ri';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSearch,
  SelectTrigger,
} from '@repo/ui/inputs/scenes/select';
import { listUsersByApplicationAction } from '../actions/user.actions';
import { useDebounce } from '../hooks/use-debounce';

interface UserOption {
  id_user: number;
  username: string;
  client?: {
    first_name?: string;
    second_name?: string;
    first_last_name?: string;
    second_last_name?: string;
    card_id?: string;
  } | null;
}

interface UserSearchableSelectProps {
  applicationId: number | null | undefined;
  value: number | null;
  onChange: (userId: number) => void;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

function getUserFullName(user?: UserOption): string {
  const client = user?.client;
  if (!client) return user?.username || 'Sin nombre';
  return [
    client.first_name,
    client.second_name,
    client.first_last_name,
    client.second_last_name,
  ]
    .filter(Boolean)
    .join(' ');
}

function getUserIdentifier(user?: UserOption): string {
  return user?.client?.card_id || user?.username || '';
}

export function UserSearchableSelect({
  applicationId,
  value,
  onChange,
  disabled,
  placeholder = 'Selecciona un usuario',
  searchPlaceholder = 'Buscar por nombre o identificación...',
  emptyMessage = 'No se encontraron usuarios',
}: UserSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const loadUsers = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);

    const result = await listUsersByApplicationAction({
      application_id: applicationId,
      search: debouncedSearch,
      per_page: 40,
    });

    if (result.success && Array.isArray(result.data)) {
      setUsers(result.data);
    } else {
      setUsers([]);
    }

    setIsLoading(false);
  }, [applicationId, debouncedSearch]);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, applicationId, debouncedSearch, loadUsers]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id_user === value),
    [users, value],
  );

  const selectedLabel = selectedUser
    ? `${getUserFullName(selectedUser)} - ${getUserIdentifier(selectedUser)}`
    : undefined;

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(v) => onChange(Number(v))}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setSearch('');
      }}
      disabled={disabled || !applicationId}
    >
      <SelectTrigger className='w-full h-11 px-3'>
        <span className='flex items-center gap-2 truncate text-sm'>
          <RiUserLine className='w-4 h-4 text-muted-foreground shrink-0' />
          <span className='truncate'>
            {selectedLabel || (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </span>
        </span>
      </SelectTrigger>
      <SelectContent className='p-0 w-[min(24rem,95vw)]'>
        <SelectSearch
          value={search}
          onValueChange={setSearch}
          placeholder={searchPlaceholder}
        />
        <div className='max-h-72 overflow-y-auto p-1.5'>
          {isLoading ? (
            <div className='flex items-center justify-center gap-2 py-8 text-muted-foreground'>
              <RiLoader2Line className='w-4 h-4 animate-spin' />
              <span className='text-sm'>Cargando usuarios...</span>
            </div>
          ) : users.length === 0 ? (
            <div className='flex flex-col items-center gap-2 px-3 py-8 text-center'>
              <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                <RiUserLine className='size-5 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium text-foreground'>{emptyMessage}</p>
            </div>
          ) : (
            users.map((user) => {
              const label = `${getUserFullName(user)} - ${getUserIdentifier(user)}`;
              return (
                <SelectItem
                  key={user.id_user}
                  value={String(user.id_user)}
                  className='my-0.5'
                >
                  <span className='flex items-center gap-2'>
                    <RiUserLine className='w-4 h-4 text-muted-foreground shrink-0' />
                    <span className='text-sm'>{label}</span>
                  </span>
                </SelectItem>
              );
            })
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
