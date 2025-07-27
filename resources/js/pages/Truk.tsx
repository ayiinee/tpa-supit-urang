import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Sampah, Supplier, Truck } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { FormEventHandler, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Truk',
        href: '/truk',
    },
];

export default function Truk() {
    const [open, setOpen] = useState(false);
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [sampahs, setSampahs] = useState<Sampah[]>([]);

    useEffect(() => {
        axios.get('/api/truk-data').then((res) => {
            setTrucks(res.data.trucks);
            setSuppliers(res.data.suppliers);
            setSampahs(res.data.sampahs);
        });
    }, []);

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        no_polisi: '',
        no_lambung: '',
        nama_supir: '',
        kode_supplier: '',
        barang: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && editId !== null) {
            router.put(route('truk.update', editId), data, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setIsEditing(false);
                    setEditId(null);
                },
            });
        } else {
            post(route('truk.store'), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string | null>(null);
    
    const handleDelete: FormEventHandler = (e) => {
        e.preventDefault();
        if (deleteId !== null) {
            destroy(route('truk.destroy', deleteId), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                    setDeleteName(null);
                    reset();
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="truk" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <form
                        onSubmit={handleSubmit}
                        className="relative h-[500px] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                    >
                        <div className="mx-2 grid grid-cols-2 items-start gap-y-2">
                            <Label htmlFor="no_lambung" className="mt-2">
                                No. Lambung
                            </Label>
                            <div>
                                <Input id="no_lambung" value={data.no_lambung} onChange={(e) => setData('no_lambung', e.target.value)} />
                                <InputError message={errors.no_lambung} className="mt-1" />
                            </div>

                            <Label htmlFor="no_polisi" className="mt-2">
                                No. Polisi
                            </Label>
                            <div>
                                <Input id="no_polisi" value={data.no_polisi} onChange={(e) => setData('no_polisi', e.target.value)} />
                                <InputError message={errors.no_polisi} className="mt-1" />
                            </div>

                            <Label htmlFor="nama_supir" className="mt-2">
                                Nama Supir
                            </Label>
                            <div>
                                <Input id="nama_supir" value={data.nama_supir} onChange={(e) => setData('nama_supir', e.target.value)} />
                                <InputError message={errors.nama_supir} className="mt-1" />
                            </div>
                            <Label htmlFor="kode_supplier" className="mt-2">
                                Supplier
                            </Label>
                            <div>
                                <Select value={data.kode_supplier} onValueChange={(value) => setData('kode_supplier', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.kode_supplier} value={String(supplier.kode_supplier)}>
                                                {supplier.nama_supplier}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.kode_supplier} className="mt-1" />
                            </div>
                            <Label htmlFor="barang" className="mt-2">
                                Jenis Sampah
                            </Label>
                            <div>
                                <Select value={data.barang} onValueChange={(value) => setData('barang', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis sampah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sampahs.map((sampah) => (
                                            <SelectItem key={sampah.id} value={String(sampah.id)}>
                                                {sampah.jenis_sampah}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.barang} className="mt-1" />
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
                                    <TableHead className="whitespace-nowrap">No. Lambung</TableHead>
                                    <TableHead className="whitespace-nowrap">No. Polisi</TableHead>
                                    <TableHead className="whitespace-nowrap">Nama Supir</TableHead>
                                    <TableHead>Barang</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trucks.map((item: any, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.no_lambung}</TableCell>
                                        <TableCell>{item.no_polisi}</TableCell>
                                        <TableCell>{item.nama_supir}</TableCell>
                                        <TableCell>{item.barang?.jenis_sampah}</TableCell>
                                        <TableCell>{item.kode_supplier?.nama_supplier}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Button
                                                variant="outline"
                                                className='mr-2'
                                                size="sm"
                                                onClick={() => {
                                                    setOpen(true);
                                                    setIsEditing(true);
                                                    setEditId(item.id);
                                                    setData({
                                                        no_lambung: item.no_lambung,
                                                        no_polisi: item.no_polisi,
                                                        nama_supir: item.nama_supir,
                                                        kode_supplier: item.kode_supplier?.kode_supplier,
                                                        barang: item.barang?.id,
                                                    });
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
                                                            setShowDeleteModal(true);
                                                            setDeleteId(item.id);
                                                            setDeleteName(item.no_polisi);
                                                        }}>
                                                        Hapus
                                                    </Button>
                                                </DialogTrigger>

                                                <DialogContent>
                                                    <DialogTitle>Konfirmasi Hapus</DialogTitle>
                                                    <DialogDescription>
                                                        Apakah Anda yakin ingin menghapus truk dengan No. Polisi {deleteName}?
                                                    </DialogDescription>
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose asChild>
                                                                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                                                    Batal
                                                                </Button>
                                                            </DialogClose>
                                                            <Button variant="destructive" onClick={handleDelete}>
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
