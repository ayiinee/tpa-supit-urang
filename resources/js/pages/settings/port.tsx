import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Ports settings',
    href: '/settings/ports-setting',
  },
];

interface PortPageProps {
  currentPorts?: {
    left: string;
    right?: string;
    cctv_ip?: string;
  };
}

export default function Port({ currentPorts }: PortPageProps) {
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);

  const { data, setData, post, processing, errors, recentlySuccessful } =
    useForm({
      left: currentPorts?.left || '',
      right: currentPorts?.right || '',
      cctv_ip: currentPorts?.cctv_ip || '',
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

  // Update form data when currentPorts prop changes
  useEffect(() => {
    if (currentPorts?.left) {
      setData('left', currentPorts.left);
    }
    if (currentPorts?.right) {
      setData('right', currentPorts.right);
    }
    if (typeof currentPorts?.cctv_ip === 'string') {
      setData('cctv_ip', currentPorts.cctv_ip);
    }
  }, [currentPorts]);

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
            description="Choose which ports to use for the left and right sensors. The selected port will be saved and used until changed."
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
                      !data.left && 'text-muted-foreground',
                      data.left && 'text-foreground font-medium'
                    )}
                  >
                    {data.left ? (
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        {data.left} (Current)
                      </span>
                    ) : (
                      'Select a port'
                    )}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availablePorts.map((port) => (
                    <DropdownMenuItem
                      key={port}
                      onSelect={() => handleSelectLeft(port)}
                      className={cn(
                        'flex items-center justify-between',
                        data.left === port && 'bg-accent'
                      )}
                    >
                      <span>{port}</span>
                      {data.left === port && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <InputError className="mt-2" message={errors.left} />
              
              {data.left && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  <Check className="h-4 w-4" />
                  <span>Currently using port: <strong>{data.left}</strong></span>
                </div>
              )}
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
                      !data.right && 'text-muted-foreground',
                      data.right && 'text-foreground font-medium'
                    )}
                  >
                    {data.right ? (
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        {data.right} (Current)
                      </span>
                    ) : (
                      'Select a port'
                    )}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availablePorts.map((port) => (
                    <DropdownMenuItem
                      key={port}
                      onSelect={() => handleSelectRight(port)}
                      className={cn(
                        'flex items-center justify-between',
                        data.right === port && 'bg-accent'
                      )}
                    >
                      <span>{port}</span>
                      {data.right === port && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <InputError className="mt-2" message={errors.right} />

              {data.right && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  <Check className="h-4 w-4" />
                  <span>Currently using port: <strong>{data.right}</strong></span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cctv_ip">IP Address CCTV</Label>
              <Input
                id="cctv_ip"
                type="text"
                placeholder="192.168.0.2"
                value={data.cctv_ip}
                onChange={(e) => setData('cctv_ip', e.target.value)}
              />
              <InputError className="mt-2" message={errors.cctv_ip} />
              <p className="text-xs text-muted-foreground">
                Masukkan IP/URL kamera CCTV yang tampil di dashboard.
              </p>
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
