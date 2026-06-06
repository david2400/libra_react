/** @format */

"use client";

import { HiOutlineUserCircle, HiOutlinePlusCircle } from "react-icons/hi2";
import { Buttons } from "@repo/ui/buttons/scenes";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/10 p-12'>
      <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
        <HiOutlineUserCircle className='h-10 w-10 text-primary' />
      </div>
      
      <h3 className='mt-6 text-xl font-semibold text-foreground'>
        No hay clientes registrados
      </h3>
      
      <p className='mt-2 max-w-md text-center text-sm text-muted-foreground'>
        Comienza agregando tu primer cliente. Los clientes son personas que pueden tener múltiples usuarios en el sistema.
      </p>
      
      <div className='mt-8 flex flex-col gap-4'>
        <Buttons
          onClick={onCreateClick}
          className='inline-flex items-center gap-2'
        >
          <HiOutlinePlusCircle className='h-5 w-5' />
          Crear Primer Cliente
        </Buttons>
        
        <div className='rounded-lg bg-blue-50 p-4 text-sm text-blue-800'>
          <p className='font-medium'>💡 Información:</p>
          <ul className='mt-2 space-y-1 text-xs'>
            <li>• Un cliente representa una persona física</li>
            <li>• Cada cliente puede tener múltiples usuarios</li>
            <li>• Los usuarios son cuentas de acceso al sistema</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
