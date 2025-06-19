import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { timbangans, newTicketNumber, trucks, sampahs } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        no_polisi: '',
        nama_supir: '',
        id_sampah: '',
        berat_masuk: '',
        berat_keluar: '',
    });

    // State untuk menentukan mode entry (masuk/keluar)
    const [entryMode, setEntryMode] = useState<'masuk' | 'keluar'>('masuk');
    const [lastEntry, setLastEntry] = useState<any>(null);

    // Fungsi untuk menghitung jumlah entry no polisi hari ini
    const getTodayEntryCount = useMemo(() => {
        if (!data.no_polisi) return 0;

        const today = new Date().toDateString();
        return timbangans.filter((item) => {
            const itemDate = new Date(item.tanggal).toDateString();
            return itemDate === today && item.no_polisi === data.no_polisi;
        }).length;
    }, [data.no_polisi, timbangans]);

    // Fungsi untuk mendapatkan entry terakhir yang belum ada berat keluarnya
    const getLastIncompleteEntry = useMemo(() => {
        if (!data.no_polisi) return null;

        const today = new Date().toDateString();
        const todayEntries = timbangans
            .filter((item) => {
                const itemDate = new Date(item.tanggal).toDateString();
                return itemDate === today && item.no_polisi === data.no_polisi;
            })
            .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

        // Cari entry terakhir yang belum ada berat keluarnya
        return todayEntries.find((entry) => !entry.berat_keluar) || null;
    }, [data.no_polisi, timbangans]);

    // Effect untuk menentukan mode entry berdasarkan jumlah entry
    useEffect(() => {
        if (!data.no_polisi) {
            setEntryMode('masuk');
            setLastEntry(null);
            return;
        }

        const incompleteEntry = getLastIncompleteEntry;

        if (incompleteEntry) {
            // Ada entry yang belum complete, mode keluar
            setEntryMode('keluar');
            setLastEntry(incompleteEntry);
            // Set data dari entry yang belum complete
            setData((prev) => ({
                ...prev,
                nama_supir: incompleteEntry.nama_supir,
                id_sampah: String(incompleteEntry.sampah?.id || ''),
                berat_masuk: String(incompleteEntry.berat_masuk),
            }));
        } else {
            // Semua entry sudah complete, mode masuk
            setEntryMode('masuk');
            setLastEntry(null);
            // Reset form kecuali no_polisi dan nama_supir
            const selectedTruck = trucks.find((truck) => truck.no_polisi === data.no_polisi);
            setData((prev) => ({
                ...prev,
                nama_supir: selectedTruck?.nama_supir || '',
                id_sampah: '',
                berat_masuk: '',
                berat_keluar: '',
            }));
        }
    }, [data.no_polisi, getLastIncompleteEntry]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (entryMode === 'keluar' && lastEntry) {
            // Update entry yang sudah ada
            put(route('dashboard.update', lastEntry.no_tiket), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setLastEntry(null);
                },
            });
        } else {
            // Buat entry baru
            post(route('dashboard.store'), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const handlePolisiChange = (value: string) => {
        setData('no_polisi', value);
        const selectedTruck = trucks.find((truck) => truck.no_polisi === value);
        if (selectedTruck) {
            setData('nama_supir', selectedTruck.nama_supir);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <form
                        onSubmit={handleSubmit}
                        className="relative h-[500px] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                    >
                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="no_tiket">No. Tiket</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="no_tiket"
                                    type="text"
                                    disabled
                                    value={entryMode === 'keluar' && lastEntry ? lastEntry.no_tiket : newTicketNumber}
                                />
                            </div>
                        </div>

                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="no_polisi">No. Polisi</Label>
                            </div>
                            <div className="flex items-center">
                                <Select value={data.no_polisi} onValueChange={handlePolisiChange} disabled={entryMode === 'keluar'}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih no. polisi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {trucks.map((truck) => (
                                            <SelectItem key={truck.no_polisi} value={truck.no_polisi}>
                                                {truck.no_polisi}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="nama_supir">Nama Supir</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="nama_supir"
                                    type="text"
                                    value={data.nama_supir}
                                    onChange={(e) => setData('nama_supir', e.target.value)}
                                    disabled={entryMode === 'keluar'}
                                />
                            </div>
                        </div>

                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="id_sampah">Jenis Sampah</Label>
                            </div>
                            <div className="flex items-center">
                                <Select
                                    value={data.id_sampah}
                                    onValueChange={(value) => setData('id_sampah', value)}
                                    disabled={entryMode === 'keluar'}
                                >
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

                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="berat_masuk">Berat Masuk</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="berat_masuk"
                                    type="number"
                                    value={data.berat_masuk}
                                    onChange={(e) => setData('berat_masuk', e.target.value)}
                                    disabled={entryMode === 'keluar'}
                                    className={entryMode === 'masuk' ? 'ring-2 ring-green-500' : ''}
                                />
                            </div>
                        </div>

                        <div className="mx-2 mb-2 grid md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="berat_keluar">Berat Keluar</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="berat_keluar"
                                    type="number"
                                    value={data.berat_keluar}
                                    onChange={(e) => setData('berat_keluar', e.target.value)}
                                    disabled={entryMode === 'masuk'}
                                    className={entryMode === 'keluar' ? 'ring-2 ring-orange-500' : ''}
                                />
                            </div>
                        </div>

                        {/* Netto calculation preview */}
                        {entryMode === 'keluar' && data.berat_keluar && lastEntry && (
                            <div className="mx-2 mb-2 grid md:grid-cols-2">
                                <div className="flex items-center space-x-2">
                                    <Label>Netto (Preview)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="text"
                                        disabled
                                        value={`${Number(lastEntry.berat_masuk) - Number(data.berat_keluar)} kg`}
                                        className="bg-gray-50 dark:bg-gray-800"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mx-2 mt-4 flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {entryMode === 'masuk' ? 'Simpan' : 'Update'}
                            </Button>
                        </div>
                    </form>

                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Tiket</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>No. Polisi</TableHead>
                                <TableHead>Nama Supir</TableHead>
                                <TableHead>Jenis Sampah</TableHead>
                                <TableHead>Berat Masuk</TableHead>
                                <TableHead>Berat Keluar</TableHead>
                                <TableHead>Netto</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {timbangans.map((item: any) => (
                                <TableRow key={item.no_tiket}>
                                    <TableCell>{item.no_tiket}</TableCell>
                                    <TableCell>{new Date(item.tanggal).toLocaleDateString()}</TableCell>
                                    <TableCell>{item.no_polisi}</TableCell>
                                    <TableCell>{item.nama_supir}</TableCell>
                                    <TableCell>{item.sampah?.jenis_sampah}</TableCell>
                                    <TableCell>{item.berat_masuk}</TableCell>
                                    <TableCell>{item.berat_keluar ?? '-'}</TableCell>
                                    <TableCell>{item.netto ?? '-'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setData({
                                                    no_polisi: item.no_polisi,
                                                    nama_supir: item.nama_supir,
                                                    id_sampah: String(item.sampah?.id || ''),
                                                    berat_masuk: String(item.berat_masuk),
                                                    berat_keluar: String(item.berat_keluar || ''),
                                                });
                                                setOpen(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                    router.delete(route('dashboard.destroy', item.no_tiket));
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
        </AppLayout>
    );
}
