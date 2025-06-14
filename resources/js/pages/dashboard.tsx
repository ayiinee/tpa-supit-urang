import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
// import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const [inputValue, setInputValue] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative h-[500px] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div>
                            <Label htmlFor="no_tiket">No. Tiket</Label>
                            <Input id="no_tiket" type='number' />
                        </div>
                        <div>
                            <Label htmlFor="no_polisi">No. Polisi</Label>
                            <Input id="no_polisi" type='number' />
                        </div>
                        <div>
                            <Label htmlFor="jenis_sampah">Jenis Sampah</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis sampah" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="organik">Organik</SelectItem>
                                    <SelectItem value="anorganik">Anorganik</SelectItem>
                                    <SelectItem value="b3">Bahan Berbahaya & Beracun</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="no_tiket">No. Tiket</Label>
                            <Input id="no_tiket" type='number' />
                        </div>
                        <div>
                            <Label htmlFor="deskripsi">Deskripsi</Label>
                            {/* <Textarea id="deskripsi" placeholder="Deskripsi TPA..." /> */}
                        </div>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis sampah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="organik">Organik</SelectItem>
                                <SelectItem value="anorganik">Anorganik</SelectItem>
                                <SelectItem value="b3">Bahan Berbahaya & Beracun</SelectItem>
                            </SelectContent>
                        </Select>
                        // Checkbox
                        <div className="flex items-center space-x-2">
                            <Checkbox id="aktif" />
                            <Label htmlFor="aktif">TPA Aktif</Label>
                        </div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
