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
import { getCompanyActiveUsersServerAction } from '@/app/[locale]/(protected)/account/user-companies/actions';
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
  companyId: number | null | undefined;
  value: number | null;
  onChange: (userId: number | null) => void;
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
  companyId,
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
    if (!companyId) return;
    setIsLoading(true);

    const result = await getCompanyActiveUsersServerAction(companyId);

    if (result && Array.isArray(result)) {
      const mapped: UserOption[] = result
        .map((uc: any) => {
          const user =
            uc?.user ??
            ({
              id_user: uc?.user_id ?? uc?.id_user,
              username:
                uc?.username ??
                uc?.user_name ??
                uc?.name ??
                `Usuario ${uc?.user_id ?? ''}`,
              client:
                uc?.client ??
                (uc?.user?.client ? uc.user.client : undefined),
            } as any);
          return user as UserOption;
        })
        .filter((user: UserOption) => user.id_user != null);
      setUsers(mapped);
    } else {
      setUsers([]);
    }

    setIsLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, companyId, loadUsers]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;
    const query = debouncedSearch.toLowerCase();
    return users.filter((user) => {
      const fullName = getUserFullName(user).toLowerCase();
      const identifier = getUserIdentifier(user).toLowerCase();
      const username = user.username.toLowerCase();
      return (
        fullName.includes(query) ||
        identifier.includes(query) ||
        username.includes(query)
      );
    });
  }, [users, debouncedSearch]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id_user === value),
    [users, value],
  );

  const selectedLabel = selectedUser
    ? `${getUserFullName(selectedUser)} - ${getUserIdentifier(selectedUser)}`
    : undefined;

  return (
    <Select
      value={value !== null ? String(value) : ''}
      onValueChange={(v) => onChange(v ? Number(v) : null)}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setSearch('');
      }}
      disabled={disabled || !companyId}
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
          ) : filteredUsers.length === 0 ? (
            <div className='flex flex-col items-center gap-2 px-3 py-8 text-center'>
              <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                <RiUserLine className='size-5 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium text-foreground'>{emptyMessage}</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
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
