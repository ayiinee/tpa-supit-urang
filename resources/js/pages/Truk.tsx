import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Sampah, Supplier, Truck } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Truk',
        href: '/truk',
    },
];

export default function Truk() {
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

    const { data, setData, post, processing, errors, reset } = useForm({
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

    const handleCancel = () => {
        reset();
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Truk" />
            <div className="flex flex-1 flex-col gap-8 p-6">
                <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {isEditing ? 'Edit Truk' : 'Tambah Truk'}
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-xl border border-gray-200 bg-gray-50/60 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="no_lambung" className="text-sm font-medium">
                                        No. Lambung
                                    </Label>
                                    <Input
                                        id="no_lambung"
                                        type="text"
                                        value={data.no_lambung}
                                        onChange={(e) => setData('no_lambung', e.target.value)}
                                        placeholder="Contoh: LMB-01"
                                    />
                                    {errors.no_lambung && (
                                        <p className="text-sm text-red-600">{errors.no_lambung}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="no_polisi" className="text-sm font-medium">
                                        No. Polisi
                                    </Label>
                                    <Input
                                        id="no_polisi"
                                        type="text"
                                        value={data.no_polisi}
                                        onChange={(e) => setData('no_polisi', e.target.value)}
                                        placeholder="Contoh: B 1234 CD"
                                        required
                                    />
                                    {errors.no_polisi && (
                                        <p className="text-sm text-red-600">{errors.no_polisi}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nama_supir" className="text-sm font-medium">
                                        Nama Supir
                                    </Label>
                                    <Input
                                        id="nama_supir"
                                        type="text"
                                        value={data.nama_supir}
                                        onChange={(e) => setData('nama_supir', e.target.value)}
                                        placeholder="Nama lengkap supir"
                                        required
                                    />
                                    {errors.nama_supir && (
                                        <p className="text-sm text-red-600">{errors.nama_supir}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kode_supplier" className="text-sm font-medium">
                                        Supplier
                                    </Label>
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
                                    {errors.kode_supplier && (
                                        <p className="text-sm text-red-600">{errors.kode_supplier}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="barang" className="text-sm font-medium">
                                        Jenis Sampah
                                    </Label>
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
                                    {errors.barang && (
                                        <p className="text-sm text-red-600">{errors.barang}</p>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 hover:bg-blue-700 text-white"
                                    >
                                        {isEditing ? 'Update' : 'Simpan'}
                                    </Button>
                                    {isEditing && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="flex-1"
                                        >
                                            Batal
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Daftar Truk
                        </h2>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="overflow-x-auto">
                                <Table className="min-w-full table-fixed">
                                    <colgroup>
                                        <col style={{ width: '56px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '170px' }} />
                                        <col style={{ width: '180px' }} />
                                        <col style={{ width: '180px' }} />
                                        <col style={{ width: '140px' }} />
                                    </colgroup>
                                    <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                                        <TableRow>
                                            <TableHead className="text-center font-semibold">No.</TableHead>
                                            <TableHead className="font-semibold whitespace-nowrap">No. Lambung</TableHead>
                                            <TableHead className="font-semibold whitespace-nowrap">No. Polisi</TableHead>
                                            <TableHead className="font-semibold whitespace-nowrap">Nama Supir</TableHead>
                                            <TableHead className="font-semibold">Barang</TableHead>
                                            <TableHead className="font-semibold">Supplier</TableHead>
                                            <TableHead className="text-center font-semibold">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trucks.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                                    Tidak ada data truk
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            trucks.map((item: any, index: number) => (
                                                <TableRow
                                                    key={item.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 divide-x divide-gray-100"
                                                >
                                                    <TableCell className="text-center font-medium">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {item.no_lambung || '-'}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {item.no_polisi}
                                                    </TableCell>
                                                    <TableCell className="text-gray-800 dark:text-gray-200">
                                                        {item.nama_supir}
                                                    </TableCell>
                                                    <TableCell className="whitespace-normal text-gray-700 dark:text-gray-300">
                                                        {item.barang?.jenis_sampah}
                                                    </TableCell>
                                                    <TableCell className="whitespace-normal text-gray-700 dark:text-gray-300">
                                                        {item.kode_supplier?.nama_supplier}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-1.5">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="px-2 py-1 text-xs h-7"
                                                                onClick={() => {
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
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="px-2 py-1 text-xs h-7 bg-red-100 text-red-700 hover:bg-red-200"
                                                                onClick={() => {
                                                                    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                                        router.delete(route('truk.destroy', item.id));
                                                                    }
                                                                }}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
