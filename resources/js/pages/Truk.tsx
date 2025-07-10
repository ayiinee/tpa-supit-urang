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
    // const { trucks, suppliers, sampahs } = usePage<PageProps>().props;
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

    const { data, setData, post, processing, errors, reset } = useForm({
        no_polisi: '',
        no_lambung: '',
        nama_supir: '',
        kode_supplier: '',
        barang: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('truk.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
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
                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="no_lambung">No. Lambung</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input id="no_lambung" type="text" value={data.no_lambung} onChange={(e) => setData('no_lambung', e.target.value)} />
                            </div>
                        </div>
                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="no_polisi">No. Polisi</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input id="no_polisi" type="text" value={data.no_polisi} onChange={(e) => setData('no_polisi', e.target.value)} />
                            </div>
                        </div>
                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="nama_supir">Nama Supir</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input id="nama_supir" type="text" value={data.nama_supir} onChange={(e) => setData('nama_supir', e.target.value)} />
                            </div>
                        </div>
                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="kode_supplier">Supplier</Label>
                            </div>
                            <div className="flex items-center">
                                <Select onValueChange={(value) => setData('kode_supplier', value)}>
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
                            </div>
                        </div>

                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="barang">Jenis Sampah</Label>
                            </div>
                            <div className="flex items-center">
                                <Select onValueChange={(value) => setData('barang', value)}>
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
                            </div>
                        </div>
                        <div className="mx-2 mt-4 flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Simpan
                            </Button>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="mt-2 text-red-500">
                                <pre>{JSON.stringify(errors, null, 2)}</pre>
                            </div>
                        )}
                    </form>
                    <div className="relative h-[500px] overflow-hidden rounded-xl border border-sidebar-border/70 md:col-span-2 dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>No. Lambung</TableHead>
                                    <TableHead>No. Polisi</TableHead>
                                    <TableHead>Nama Supir</TableHead>
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
                                        <TableCell>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setOpen(true);
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
                                                onClick={() => {
                                                    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                        router.delete(route('truk.destroy', item.id));
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
