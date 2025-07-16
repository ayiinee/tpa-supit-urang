import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Sampah',
        href: '/sampah',
    },
];

export default function Sampah() {
    const { sampahs } = usePage<PageProps>().props;
    
    const { data, setData, post, processing, errors, reset } = useForm({
        jenis_sampah: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && editId !== null) {
            router.put(route('sampah.update', editId), data, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setIsEditing(false);
                    setEditId(null);
                },
            });
        } else {
            post(route('sampah.store'), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Sampah" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <form onSubmit={handleSubmit} className="relative h-[500px] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div className="grid md:grid-cols-2 mb-2 mx-2" >
                            <div  className="flex items-center space-x-2">
                                <Label htmlFor="jenis_sampah">Jenis Sampah</Label>
                            </div>
                            <div  className="flex items-center space-x-2">
                                <Input id="jenis_sampah" type='text' 
                                value={data.jenis_sampah} 
                                onChange={(e) => setData('jenis_sampah', e.target.value)}/>
                            </div>
                        </div> 
                        <div className="flex justify-end mx-2 mt-4">
                            <Button type='submit' disabled={processing}>Simpan</Button>
                        </div>
                        
                    </form>

                    <div className="relative h-[500px] md:col-span-2 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Jenis Sampah</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sampahs.map((item: any, index: number) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.jenis_sampah}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setData({
                                                    jenis_sampah: item.jenis_sampah,
                                                });
                                                setIsEditing(true);
                                                setEditId(item.id);
                                            }}
                                        >
                                            Edit
                                        </Button>

                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={() => {
                                                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                    router.delete(route('sampah.destroy', item.id));
                                                }
                                            }}
                                        >
                                            Hapus
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
