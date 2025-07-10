import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Ports settings',
    href: '/settings/ports-setting',
  },
];

export default function Port() {
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);

  const { data, setData, post, processing, errors, recentlySuccessful } =
    useForm({
      left: '',
      right: '',
    });

  useEffect(() => {
    axios
      .get('/api/available-ports')
      .then((res) => {
        if (res.data.ports) {
          setAvailablePorts(res.data.ports);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSelectLeft = (value: string) => {
    setData('left', value);
  };

  const handleSelectRight = (value: string) => {
    setData('right', value);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post('/api/set-ports', {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Ports settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Ports settings"
            description="Choose which ports to use for the left and right sensors."
          />

          <form onSubmit={submit} className="space-y-6">
            {/* LEFT PORT */}
            <div className="grid gap-2">
              <Label htmlFor="left">Left Port</Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-between w-full',
                      !data.left && 'text-muted-foreground'
                    )}
                  >
                    {data.left || 'Select a port'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availablePorts.map((port) => (
                    <DropdownMenuItem
                      key={port}
                      onSelect={() => handleSelectLeft(port)}
                    >
                      {port}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <InputError className="mt-2" message={errors.left} />
            </div>

            {/* RIGHT PORT */}
            <div className="grid gap-2">
              <Label htmlFor="right">Right Port</Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-between w-full',
                      !data.right && 'text-muted-foreground'
                    )}
                  >
                    {data.right || 'Select a port'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availablePorts.map((port) => (
                    <DropdownMenuItem
                      key={port}
                      onSelect={() => handleSelectRight(port)}
                    >
                      {port}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <InputError className="mt-2" message={errors.right} />
            </div>

            <div className="flex items-center gap-4">
              <Button disabled={processing}>Save</Button>

              <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out"
                enterFrom="opacity-0"
                leave="transition ease-in-out"
                leaveTo="opacity-0"
              >
                <p className="text-sm text-neutral-600">Saved.</p>
              </Transition>
            </div>
          </form>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
