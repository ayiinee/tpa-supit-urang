import CCTV from '@/components/cctv';
import TruckMap from '@/components/TruckMap';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ZoneStats from '@/components/zone-stats';
import { webSocket } from '@/hooks/webSocket';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps, Timbangan } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ChevronsUpDown, Download, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { trucks, sampahs, cctvIp } = usePage<PageProps>().props;
    const cctvSrc = cctvIp || '192.168.0.2';
    const [timbangans, setTimbangans] = useState<Timbangan[]>([]);
    const [open, setOpen] = useState(false);
    const [newTicketNumber, setNewTicketNumber] = useState('');
    const [entryMode, setEntryMode] = useState<'masuk' | 'keluar'>('masuk');
    const [lastEntry, setLastEntry] = useState<any>(null);
    const [truckPositions, setTruckPositions] = useState([]);
    const [todayStats, setTodayStats] = useState<{ total_netto_today: number } | null>(null);
    const [noPolisiOpen, setNoPolisiOpen] = useState(false);
    const [noPolisiQuery, setNoPolisiQuery] = useState('');
    const [noPolisiOptions, setNoPolisiOptions] = useState(trucks);
    const [isNoPolisiLoading, setIsNoPolisiLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states
    const [filterYear, setFilterYear] = useState('2026');
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterDay, setFilterDay] = useState('all');

    // WebSocket hook for real-time weight updates
    const { isConnected, weights, lastUpdates, activeSensor, activeWeight, activeLastUpdate, connectionError, reconnect } = webSocket();

    // State for weight timeout
    const [weightTimeout, setWeightTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isWeightResetting, setIsWeightResetting] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        no_lambung: '',
        no_polisi: '',
        nama_supir: '',
        id_sampah: '',
        berat_masuk: '',
        berat_keluar: '',
    });

    const fetchTimbangans = (page = 1) => {
        setIsLoading(true);
        const params = new URLSearchParams({
            page: String(page),
            per_page: String(itemsPerPage),
        });

        if (filterYear) {
            params.set('year', filterYear);
        }
        if (filterMonth !== 'all') {
            params.set('month', filterMonth);
        }
        if (filterDay !== 'all') {
            params.set('day', filterDay);
        }

        axios
            .get(`/api/timbangans?${params.toString()}`)
            .then((res) => {
                if (res.data.data) {
                    // If response has pagination structure
                    setTimbangans(res.data.data);
                    setTotalItems(res.data.total || res.data.data.length);
                } else {
                    // If response is just array, implement client-side pagination
                    setTimbangans(res.data);
                    setTotalItems(res.data.length);
                }
            })
            .catch((err) => {
                console.error('Gagal fetch timbangans:', err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        axios.get('/api/timbangan/next-ticket').then((res) => {
            setNewTicketNumber(res.data.no_tiket);
        });
    }, []);

    useEffect(() => {
        fetchTimbangans(currentPage);
    }, [currentPage, filterYear, filterMonth, filterDay]);

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

    // Removed old polling - now using real-time WebSocket data only
    // The activeWeight from WebSocket is automatically updated via useEffect below

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

    // WebSocket automatically handles live weight updates
    // No more polling needed!

    useEffect(() => {
        fetch('/api/dashboard/statistik')
            .then((res) => res.json())
            .then((data) => {
                console.log('Statistik harian:', data); // cek isi
                setTodayStats(data);
            })
            .catch((error) => console.error('Gagal ambil statistik:', error));
    }, []);

    // Real-time weight update from WebSocket - reset to 0 when no data
    useEffect(() => {
        // Clear existing timeout
        if (weightTimeout) {
            clearTimeout(weightTimeout);
        }

        if (entryMode === 'masuk') {
            setData((prev) => ({
                ...prev,
                berat_masuk: String(activeWeight || 0),
            }));
        } else if (entryMode === 'keluar') {
            setData((prev) => ({
                ...prev,
                berat_keluar: String(activeWeight || 0),
            }));
        }

        // Clear resetting flag when new data arrives
        if (activeWeight > 0) {
            setIsWeightResetting(false);
        }

        // Set timeout to reset weight display if no data for 3 seconds
        if (activeWeight > 0) {
            const timeout = setTimeout(() => {
                setIsWeightResetting(true);
                if (entryMode === 'masuk') {
                    setData((prev) => ({
                        ...prev,
                        berat_masuk: '0',
                    }));
                } else if (entryMode === 'keluar') {
                    setData((prev) => ({
                        ...prev,
                        berat_keluar: '0',
                    }));
                }
                // Reset the flag after a short delay
                setTimeout(() => setIsWeightResetting(false), 1000);
            }, 3000); // 3 seconds timeout

            setWeightTimeout(timeout);
        }

        // Cleanup timeout on unmount
        return () => {
            if (weightTimeout) {
                clearTimeout(weightTimeout);
            }
        };
    }, [activeWeight, entryMode]);

    // Reset weight display when WebSocket disconnects
    useEffect(() => {
        if (!isConnected) {
            if (entryMode === 'masuk') {
                setData((prev) => ({
                    ...prev,
                    berat_masuk: '0',
                }));
            } else if (entryMode === 'keluar') {
                setData((prev) => ({
                    ...prev,
                    berat_keluar: '0',
                }));
            }
        }
    }, [isConnected, entryMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (entryMode === 'keluar' && lastEntry) {
            put(route('dashboard.update', lastEntry.no_tiket), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setLastEntry(null);
                    fetchTimbangans(currentPage);
                },
            });
        } else {
            post(route('dashboard.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    fetchTimbangans(currentPage);
                },
            });
        }
    };

    const handlePolisiChange = (value: string) => {
        setData('no_polisi', value);
        const selectedTruck = noPolisiOptions.find((truck) => truck.no_polisi === value) || trucks.find((truck) => truck.no_polisi === value);
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

    const handleExport = () => {
        const params = new URLSearchParams({
            year: filterYear,
        });

        if (filterMonth !== 'all') {
            params.set('month', filterMonth);
        }

        if (filterDay !== 'all') {
            params.set('day', filterDay);
        }

        window.open(`/timbangan/export?${params.toString()}`, '_blank');
    };

    const handlePrint = (no_tiket: string) => {
        window.open(`/timbangan/print/${no_tiket}`, '_blank');
    };

    // Pagination logic
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Client-side pagination if server doesn't support it
    const paginatedTimbangans = timbangans.length === totalItems ? timbangans.slice(startIndex, endIndex) : timbangans;

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const currentYear = new Date().getFullYear();
    const yearStart = Math.min(2026, currentYear - 3);
    const yearEnd = Math.max(2026, currentYear + 3);
    const yearOptions = Array.from({ length: yearEnd - yearStart + 1 }, (_, index) => String(yearStart + index));

    const monthOptions = [
        { value: 'all', label: 'Semua Bulan' },
        { value: '1', label: 'Januari' },
        { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' },
        { value: '4', label: 'April' },
        { value: '5', label: 'Mei' },
        { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' },
        { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' },
    ];

    const daysInSelectedMonth = filterMonth === 'all' ? 31 : new Date(Number(filterYear), Number(filterMonth), 0).getDate();

    const dayOptions = Array.from({ length: daysInSelectedMonth }, (_, index) => ({
        value: String(index + 1),
        label: String(index + 1),
    }));

    useEffect(() => {
        if (filterDay !== 'all' && Number(filterDay) > daysInSelectedMonth) {
            setFilterDay('all');
        }
    }, [filterDay, daysInSelectedMonth]);

    useEffect(() => {
        setNoPolisiOptions(trucks);
    }, [trucks]);

    useEffect(() => {
        if (!noPolisiOpen) {
            return;
        }

        const query = noPolisiQuery.trim();
        const timeout = setTimeout(() => {
            setIsNoPolisiLoading(true);
            axios
                .get('/api/trucks/search', { params: { query } })
                .then((res) => {
                    setNoPolisiOptions(res.data.trucks || []);
                })
                .catch((error) => {
                    console.error('Gagal cari no. polisi:', error);
                })
                .finally(() => {
                    setIsNoPolisiLoading(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [noPolisiOpen, noPolisiQuery]);

    const handleYearChange = (value: string) => {
        setFilterYear(value);
        setCurrentPage(1);
    };

    const handleMonthChange = (value: string) => {
        setFilterMonth(value);
        setCurrentPage(1);
    };

    const handleDayChange = (value: string) => {
        setFilterDay(value);
        setCurrentPage(1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min items-start gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border p-2 pb- text-center shadow-sm">
                            <div className="mb-2 flex items-center justify-center gap-2">
                                <p className="text-sm text-muted-foreground">Indikator Berat</p>
                                <div
                                    className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
                                    title={isConnected ? 'WebSocket Connected - Auto Reset to 0' : 'WebSocket Disconnected'}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className={`${activeSensor === 'LEFT' ? 'ring-2 ring-green-500' : ''}`}>
                                    <p className="text-xs text-muted-foreground">Kiri</p>
                                    <p className={`text-xl font-bold ${weights.left > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {weights.left || 0} kg
                                    </p>
                                    {lastUpdates.left && <p className="text-[10px] text-muted-foreground">{lastUpdates.left.toLocaleTimeString()}</p>}
                                </div>

                                <div className={`${activeSensor === 'RIGHT' ? 'ring-2 ring-green-500' : ''}`}>
                                    <p className="text-xs text-muted-foreground">Kanan</p>
                                    <p className={`text-xl font-bold ${weights.right > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {weights.right || 0} kg
                                    </p>
                                    {lastUpdates.right && (
                                        <p className="text-[10px] text-muted-foreground">{lastUpdates.right.toLocaleTimeString()}</p>
                                    )}
                                </div>
                            </div>

                            {activeSensor && (
                                <div className="mt-2 text-xs text-muted-foreground">Aktif: {activeSensor === 'LEFT' ? 'Kiri' : 'Kanan'}</div>
                            )}

                            {isWeightResetting && <div className="mt-1 animate-pulse text-xs text-orange-500">Resetting to 0 - No data received</div>}

                            {connectionError && (
                                <div className="mt-2">
                                    <p className="text-xs text-red-500">{connectionError}</p>
                                    <Button variant="outline" size="sm" onClick={reconnect} className="mt-1 text-xs">
                                        Reconnect
                                    </Button>
                                </div>
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="relative items-start overflow-hidden rounded-xl border border-sidebar-border/70 pt-2 p-4 dark:border-sidebar-border"
                        >
                            <div className="m-4 mx-2 mb-2 grid md:grid-cols-2">
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
                                    <Popover
                                        open={noPolisiOpen}
                                        onOpenChange={(nextOpen) => {
                                            setNoPolisiOpen(nextOpen);
                                            if (nextOpen) {
                                                setNoPolisiQuery('');
                                            }
                                        }}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="no_polisi"
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={noPolisiOpen}
                                                className="w-full justify-between"
                                                disabled={entryMode === 'keluar'}
                                            >
                                                {data.no_polisi || 'Pilih no. polisi'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-[var(--radix-popover-trigger-width)] p-0"
                                            side="bottom"
                                            align="start"
                                            sideOffset={4}
                                            avoidCollisions={false}
                                        >
                                            <Command>
                                                <CommandInput
                                                    placeholder="Cari no. polisi..."
                                                    value={noPolisiQuery}
                                                    onValueChange={setNoPolisiQuery}
                                                />
                                                <CommandList className="max-h-52">
                                                    {isNoPolisiLoading && (
                                                        <div className="px-2 py-1.5 text-xs text-muted-foreground">Mencari...</div>
                                                    )}
                                                    <CommandEmpty>No. polisi tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {noPolisiOptions.map((truck) => (
                                                            <CommandItem
                                                                key={truck.no_polisi}
                                                                value={truck.no_polisi}
                                                                onSelect={() => {
                                                                    handlePolisiChange(truck.no_polisi);
                                                                    setNoPolisiOpen(false);
                                                                }}
                                                            >
                                                                {truck.no_polisi}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="mx-2 mb-2 grid md:grid-cols-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="no_lambung">No. Lambung</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="no_lambung"
                                        type="text"
                                        value={data.no_lambung}
                                        onChange={(e) => setData('no_lambung', e.target.value)}
                                        disabled={entryMode === 'keluar'}
                                    />
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
                                        <SelectContent
                                            side="bottom"
                                            align="start"
                                            sideOffset={4}
                                            avoidCollisions={false}
                                            className="max-h-52"
                                        >
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

                            <div className="mx-2 mt-4 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {entryMode === 'masuk' ? 'Simpan' : 'Update'}
                                </Button>
                            </div>
                        </form>
                    </div>

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
                            <CCTV src={cctvSrc} />
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <TruckMap trucks={truckPositions} />
                        </div>
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <h3 className="text-lg font-semibold">Data Timbangan</h3>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="grid gap-1">
                                <Label htmlFor="filter-year" className="text-xs">
                                    Tahun
                                </Label>
                                <Select value={filterYear} onValueChange={handleYearChange}>
                                    <SelectTrigger id="filter-year" className="h-8 w-28 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={4}
                                        avoidCollisions={false}
                                        className="max-h-52"
                                    >
                                        {yearOptions.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="filter-month" className="text-xs">
                                    Bulan
                                </Label>
                                <Select value={filterMonth} onValueChange={handleMonthChange}>
                                    <SelectTrigger id="filter-month" className="h-8 w-40 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={4}
                                        avoidCollisions={false}
                                        className="max-h-52"
                                    >
                                        {monthOptions.map((month) => (
                                            <SelectItem key={month.value} value={month.value}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="filter-day" className="text-xs">
                                    Hari
                                </Label>
                                <Select value={filterDay} onValueChange={handleDayChange}>
                                    <SelectTrigger id="filter-day" className="h-8 w-28 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={4}
                                        avoidCollisions={false}
                                        className="max-h-52"
                                    >
                                        <SelectItem value="all">Semua Hari</SelectItem>
                                        <div className="px-1 pb-1">
                                            <div className="grid grid-cols-7 gap-1">
                                                {dayOptions.map((day) => (
                                                    <SelectItem
                                                        key={day.value}
                                                        value={day.value}
                                                        className="!h-8 !w-8 !justify-center !rounded-md !p-0 !pr-0 !pl-0 text-center text-xs data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground [&>span]:hidden"
                                                    >
                                                        {day.label}
                                                    </SelectItem>
                                                ))}
                                            </div>
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleExport} size="sm" className="flex h-8 items-center gap-2 text-xs">
                                <Download className="h-3.5 w-3.5" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
                                            Loading...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedTimbangans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                                        Tidak ada data timbangan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedTimbangans.map((item: any) => (
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
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePrint(item.no_tiket)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Printer className="h-3 w-3" />
                                                    Print
                                                </Button>
                                                <Button
                                                    variant="outline"
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
                                                            router.delete(route('dashboard.destroy', item.no_tiket), {
                                                                onSuccess: () => {
                                                                    // If we're on the last page and it becomes empty, go to previous page
                                                                    const newTotalItems = totalItems - 1;
                                                                    const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
                                                                    const targetPage =
                                                                        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;

                                                                    if (targetPage !== currentPage) {
                                                                        setCurrentPage(targetPage);
                                                                    } else {
                                                                        fetchTimbangans(currentPage);
                                                                    }
                                                                },
                                                            });
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 sm:px-3"
                                >
                                    <span className="hidden sm:inline">Previous</span>
                                    <span className="sm:hidden">&lt;</span>
                                </Button>

                                <div className="hidden items-center space-x-1 sm:flex">
                                    {getPageNumbers().map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className="min-w-[2.5rem]"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>

                                <div className="flex items-center space-x-2 sm:hidden">
                                    <span className="text-sm text-muted-foreground">
                                        {currentPage} / {totalPages}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 sm:px-3"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <span className="sm:hidden">&gt;</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
