import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Supplier',
        href: '/supplier',
    },
];

export default function Supplier() {
    const { suppliers } = usePage<PageProps>().props;

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors,
    } = useForm({
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
        } else {
            post(route('supplier.store'), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string | null>(null);

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        if (deleteId !== null) {
            destroy(route('supplier.destroy', deleteId), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    setShowDeleteModal(false);
                    setDeleteId(null);
                    setDeleteName(null);
                },
                onFinish: () => reset(),
            });
        }
    };

    const closeModal = () => {
        clearErrors();
        reset();
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
                        <div className="grid grid-cols-2 items-start gap-x-4 gap-y-4">
                            {/* Kode Supplier */}
                            <Label htmlFor="kode_supplier" className="mt-2">
                                Kode Supplier
                            </Label>
                            <div>
                                <Input id="kode_supplier" value={data.kode_supplier} onChange={(e) => setData('kode_supplier', e.target.value)} />
                                <InputError message={errors.kode_supplier} className="mt-1" />
                            </div>

                            {/* Nama Supplier */}
                            <Label htmlFor="nama_supplier" className="mt-2">
                                Nama Supplier
                            </Label>
                            <div>
                                <Input id="nama_supplier" value={data.nama_supplier} onChange={(e) => setData('nama_supplier', e.target.value)} />
                                <InputError message={errors.nama_supplier} className="mt-1" />
                            </div>

                            {/* Alamat */}
                            <Label htmlFor="alamat" className="mt-2">
                                Alamat
                            </Label>
                            <div>
                                <Textarea id="alamat" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} />
                                <InputError message={errors.alamat} className="mt-1" />
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
                                                variant="outline"
                                                className="mr-2"
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
                                            >
                                                Edit
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setDeleteId(item.id);
                                                            setDeleteName(item.nama_supplier);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    >
                                                        Hapus
                                                    </Button>
                                                </DialogTrigger>

                                                <DialogContent>
                                                    <DialogTitle>Konfirmasi Hapus</DialogTitle>
                                                    <DialogDescription>
                                                        Apakah kamu yakin ingin menghapus supplier <strong>{deleteName}</strong>? Tindakan ini tidak
                                                        dapat dibatalkan.
                                                    </DialogDescription>
                                                    <DialogFooter className="gap-2">
                                                        <DialogClose asChild>
                                                            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                                                Batal
                                                            </Button>
                                                        </DialogClose>
                                                        <Button variant="destructive" onClick={deleteUser}>
                                                            Hapus
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
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
