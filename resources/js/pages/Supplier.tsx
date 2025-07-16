import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Supplier',
        href: '/supplier',
    },
];

export default function Supplier() {
    const { suppliers } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        kode_supplier: '',
        nama_supplier: '',
        alamat: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && editId !== null) {
            router.put(route('supplier.update', editId), data, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setIsEditing(false);
                    setEditId(null);
                },
            });
        } else{
                post(route('supplier.store'), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Supplier" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <form
                        onSubmit={handleSubmit}
                        className="relative h-[500px] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                    >
                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="kode_supplier">Kode Supplier</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="kode_supplier"
                                    type="text"
                                    value={data.kode_supplier}
                                    onChange={(e) => setData('kode_supplier', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="nama_supplier">Nama Supplier</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="nama_supplier"
                                    type="text"
                                    value={data.nama_supplier}
                                    onChange={(e) => setData('nama_supplier', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="alamat">Alamat</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Textarea id="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} />
                            </div>
                        </div>
                        <div className="mx-2 mt-4 flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Simpan
                            </Button>
                        </div>
                    </form>

                    <div className="relative h-[500px] overflow-hidden rounded-xl border border-sidebar-border/70 md:col-span-2 dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Kode Supplier</TableHead>
                                    <TableHead>Nama Supplier</TableHead>
                                    <TableHead>Alamat</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.map((item: any, index: number) => (
                                    <TableRow key={item.kode_supplier}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.kode_supplier}</TableCell>
                                        <TableCell>{item.nama_supplier}</TableCell>
                                        <TableCell>{item.alamat}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setData({
                                                        kode_supplier: item.kode_supplier,
                                                        nama_supplier: item.nama_supplier,
                                                        alamat: item.alamat,
                                                    });
                                                    setIsEditing(true);
                                                    setEditId(item.id);
                                                }}
                                            >Edit

                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                        router.delete(route('supplier.destroy', item.id));
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
