import CCTV from '@/components/cctv';
import InputError from '@/components/input-error';
import TruckMap from '@/components/TruckMap';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ZoneStats from '@/components/zone-stats';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps, Timbangan } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { trucks, sampahs } = usePage<PageProps>().props;
    const [timbangans, setTimbangans] = useState<Timbangan[]>([]);
    const [open, setOpen] = useState(false);
    const [newTicketNumber, setNewTicketNumber] = useState('');
    const [entryMode, setEntryMode] = useState<'masuk' | 'keluar'>('masuk');
    const [lastEntry, setLastEntry] = useState<any>(null);
    const [truckPositions, setTruckPositions] = useState([]);
    const [liveWeight, setLiveWeight] = useState(0);
    const [todayStats, setTodayStats] = useState<{ total_netto_today: number } | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        no_lambung: '',
        no_polisi: '',
        nama_supir: '',
        id_sampah: '',
        berat_masuk: '',
        berat_keluar: '',
    });

    const fetchTimbangans = () => {
        axios
            .get('/api/timbangans')
            .then((res) => {
                setTimbangans(res.data); // pastikan ini array
            })
            .catch((err) => {
                console.error('Gagal fetch timbangans:', err);
            });
    };

    useEffect(() => {
        axios.get('/api/timbangan/next-ticket').then((res) => {
            setNewTicketNumber(res.data.no_tiket);
        });
        fetchTimbangans();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get('/api/trackings/latest');
            setTruckPositions(res.data);
        };

        fetchData();

        // Optional: refresh setiap 15 detik
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get('/api/external/berat-terakhir');
                const { no_polisi, berat } = res.data;

                if (no_polisi && berat) {
                    setData((prev) => ({
                        ...prev,
                        no_polisi,
                    }));

                    handlePolisiChange(no_polisi); // trigger autofill lainnya

                    if (entryMode === 'masuk') {
                        setData((prev) => ({
                            ...prev,
                            berat_masuk: String(berat),
                        }));
                    } else {
                        setData((prev) => ({
                            ...prev,
                            berat_keluar: String(berat),
                        }));
                    }
                }
            } catch (err) {
                console.error('Gagal fetch berat dari eksternal:', err);
            }
        }, 2000); // polling tiap 2 detik

        return () => clearInterval(interval);
    }, [entryMode]);

    useEffect(() => {
        if (!data.no_polisi) {
            setEntryMode('masuk');
            setLastEntry(null);
            return;
        }

        axios
            .get(`/api/timbangan/incomplete/${data.no_polisi}`)
            .then((res) => {
                const incompleteEntry = res.data.entry;

                if (incompleteEntry) {
                    setEntryMode('keluar');
                    setLastEntry(incompleteEntry);
                    setData((prev) => ({
                        ...prev,
                        nama_supir: incompleteEntry.nama_supir,
                        id_sampah: String(incompleteEntry.sampah?.id_sampah || ''),
                        berat_masuk: String(incompleteEntry.berat_masuk),
                    }));
                } else {
                    setEntryMode('masuk');
                    setLastEntry(null);

                    const selectedTruck = trucks.find((truck) => truck.no_polisi === data.no_polisi);
                    setData((prev) => ({
                        ...prev,
                        nama_supir: selectedTruck?.nama_supir || '',
                        id_sampah: prev.id_sampah || '',
                        berat_masuk: '',
                        berat_keluar: '',
                    }));
                }
            })
            .catch((err) => {
                console.error('Gagal fetch entry:', err);
                setEntryMode('masuk');
                setLastEntry(null);
            });
    }, [data.no_polisi]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get('/api/live-weight');
                setLiveWeight(res.data.berat);
            } catch (e) {
                console.error('Gagal fetch berat:', e);
            }
        }, 1000); // polling tiap 1 detik

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetch('/api/dashboard/statistik')
            .then((res) => res.json())
            .then((data) => {
                console.log('Statistik harian:', data); // cek isi
                setTodayStats(data);
            })
            .catch((error) => console.error('Gagal ambil statistik:', error));
    }, []);

    useEffect(() => {
        if (entryMode === 'masuk') {
            setData((prev) => ({
                ...prev,
                berat_masuk: String(liveWeight),
            }));
        } else if (entryMode === 'keluar') {
            setData((prev) => ({
                ...prev,
                berat_keluar: String(liveWeight),
            }));
        }
    }, [liveWeight, entryMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (entryMode === 'keluar' && lastEntry) {
            put(route('dashboard.update', lastEntry.no_tiket), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setLastEntry(null);
                    fetchTimbangans();
                },
            });
        } else {
            post(route('dashboard.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    fetchTimbangans();
                },
            });
        }
    };

    const handlePolisiChange = (value: string) => {
        setData('no_polisi', value);
        const selectedTruck = trucks.find((truck) => truck.no_polisi === value);
        if (selectedTruck) {
            setData((prev) => ({
                ...prev,
                nama_supir: selectedTruck.nama_supir,
                id_sampah: '', // akan kita isi otomatis di bawah
                no_lambung: selectedTruck.no_lambung, // tambahkan no_lambung
            }));

            // Cari id sampah berdasarkan jenis sampah dari `barang`
            const matchingSampah = sampahs.find((sampah) => sampah.jenis_sampah === selectedTruck.barang?.jenis_sampah);

            if (matchingSampah) {
                setData((prev) => ({
                    ...prev,
                    id_sampah: String(matchingSampah.id),
                }));
            }
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
                        <div className="rounded-xl border border-dashed p-4 mb-4 text-center shadow-sm">
                            <p className="text-sm text-muted-foreground">Berat Real-Time</p>
                            <p className="text-3xl font-bold text-green-600">{liveWeight} kg</p>
                        </div>

                        <div className="mx-2 grid grid-cols-2 items-start gap-y-2">
                            <Label htmlFor="no_tiket" className="mt-2">
                                No. Tiket
                            </Label>
                            <div>
                                <Input
                                    id="no_tiket"
                                    type="text"
                                    disabled
                                    value={entryMode === 'keluar' && lastEntry ? lastEntry.no_tiket : newTicketNumber}
                                />
                            </div>

                            <Label htmlFor="no_polisi" className="mt-2">
                                No. Polisi
                            </Label>
                            <div>
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
                                <InputError message={errors.no_polisi} className="mt-1" />
                            </div>

                            <Label htmlFor="no_lambung" className="mt-2">
                                No. Lambung
                            </Label>
                            <div>
                                <Input
                                    id="no_lambung"
                                    type="text"
                                    value={data.no_lambung}
                                    onChange={(e) => setData('no_lambung', e.target.value)}
                                    disabled={entryMode === 'keluar'}
                                />
                                <InputError message={errors.no_lambung} className="mt-1" />
                            </div>

                            <Label htmlFor="nama_supir" className="mt-2">
                                Nama Supir
                            </Label>
                            <div>
                                <Input
                                    id="nama_supir"
                                    type="text"
                                    value={data.nama_supir}
                                    onChange={(e) => setData('nama_supir', e.target.value)}
                                    disabled={entryMode === 'keluar'}
                                />
                                <InputError message={errors.nama_supir} className="mt-1" />
                            </div>

                            <Label htmlFor="id_sampah" className="mt-2">
                                Jenis Sampah
                            </Label>
                            <div>
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
                                <InputError message={errors.id_sampah} className="mt-1" />
                            </div>

                            <Label htmlFor="berat_masuk" className="mt-2">
                                Berat Masuk
                            </Label>
                            <div>
                                <Input
                                    id="berat_masuk"
                                    type="number"
                                    value={data.berat_masuk}
                                    onChange={(e) => setData('berat_masuk', e.target.value)}
                                    disabled={entryMode === 'keluar'}
                                    className={entryMode === 'masuk' ? 'ring-2 ring-green-500' : ''}
                                />
                                <InputError message={errors.berat_masuk} className="mt-1" />
                            </div>

                            <Label htmlFor="berat_keluar" className="mt-2">
                                Berat Keluar
                            </Label>
                            <div>
                                <Input
                                    id="berat_keluar"
                                    type="number"
                                    value={data.berat_keluar}
                                    onChange={(e) => setData('berat_keluar', e.target.value)}
                                    disabled={entryMode === 'masuk'}
                                    className={entryMode === 'keluar' ? 'ring-2 ring-orange-500' : ''}
                                />
                                <InputError message={errors.berat_keluar} className="mt-1" />
                            </div>
                        </div>

                        <div className="mx-2 mt-4 flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {entryMode === 'masuk' ? 'Simpan' : 'Update'}
                            </Button>
                        </div>
                    </form>

                    <div className="relative h-[500px] overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h4 className="mb-2 font-semibold">Info Statistik</h4>
                        <Card>
                            <div className="flex flex-col pr-4 pl-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Jumlah Sampah</span>
                                    <span className="text-xl font-bold">
                                        {todayStats ? `${todayStats.total_netto_today.toFixed(2)} ton` : 'Loading...'}
                                    </span>
                                </div>
                            </div>
                        </Card>
                        <h4 className="mt-4 mb-2 font-semibold">Jumlah Truk</h4>
                        <div className="mb-4 items-center justify-between gap-4">
                            <ZoneStats></ZoneStats>
                        </div>
                    </div>
                    <div>
                        <div className="relative mb-4 aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <CCTV src="192.168.0.2" />
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <TruckMap trucks={truckPositions} />
                        </div>
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Tiket</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead className="whitespace-nowrap">No. Polisi</TableHead>
                                <TableHead className="whitespace-nowrap">No. Lambung</TableHead>
                                <TableHead className="whitespace-nowrap">Nama Supir</TableHead>
                                <TableHead>Jenis Sampah</TableHead>
                                <TableHead className="whitespace-nowrap">Berat Masuk</TableHead>
                                <TableHead className="whitespace-nowrap">Berat Keluar</TableHead>
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
                                    <TableCell>{item.no_lambung || '-'}</TableCell>
                                    <TableCell>{item.nama_supir}</TableCell>
                                    <TableCell className="whitespace-normal">{item.sampah?.jenis_sampah}</TableCell>
                                    <TableCell>{item.berat_masuk}</TableCell>
                                    <TableCell>{item.berat_keluar ?? '-'}</TableCell>
                                    <TableCell>{item.netto ?? '-'}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <Button
                                            variant="outline"
                                            className='mr-2'
                                            size="sm"
                                            onClick={() => {
                                                setData({
                                                    no_lambung: item.no_lambung || '',
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
