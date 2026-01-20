import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Pagination logic
    const totalPages = Math.ceil(suppliers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = suppliers.slice(startIndex, endIndex);

    const paginationInfo = useMemo(() => {
        const start = suppliers.length === 0 ? 0 : startIndex + 1;
        const end = Math.min(endIndex, suppliers.length);
        return `Menampilkan ${start}–${end} dari ${suppliers.length}`;
    }, [startIndex, endIndex, suppliers.length]);

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

    const handleCancel = () => {
        reset();
        setIsEditing(false);
        setEditId(null);
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Supplier" />
            
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Grid Layout: 360px | 1fr pada layar besar */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
                    
                    {/* Form Section - Sticky di layar besar */}
                    <div className="lg:sticky lg:top-4 lg:self-start">
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-gray-900">
                            <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {isEditing ? 'Edit Supplier' : 'Tambah Supplier'}
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kode_supplier" className="text-sm font-medium">
                                        Kode Supplier
                                    </Label>
                                    <Input
                                        id="kode_supplier"
                                        type="text"
                                        value={data.kode_supplier}
                                        onChange={(e) => setData('kode_supplier', e.target.value)}
                                        placeholder="Contoh: SUP001"
                                        className="w-full"
                                    />
                                    {errors.kode_supplier && (
                                        <p className="text-sm text-red-600">{errors.kode_supplier}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nama_supplier" className="text-sm font-medium">
                                        Nama Supplier
                                    </Label>
                                    <Input
                                        id="nama_supplier"
                                        type="text"
                                        value={data.nama_supplier}
                                        onChange={(e) => setData('nama_supplier', e.target.value)}
                                        placeholder="Nama lengkap supplier"
                                        className="w-full"
                                    />
                                    {errors.nama_supplier && (
                                        <p className="text-sm text-red-600">{errors.nama_supplier}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="alamat" className="text-sm font-medium">
                                        Alamat
                                    </Label>
                                    <Textarea
                                        id="alamat"
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        placeholder="Alamat lengkap supplier"
                                        className="w-full resize-none"
                                        rows={4}
                                    />
                                    {errors.alamat && (
                                        <p className="text-sm text-red-600">{errors.alamat}</p>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button 
                                        onClick={handleSubmit}
                                        disabled={processing}
                                        className="flex-1"
                                    >
                                        {isEditing ? 'Update' : 'Simpan'}
                                    </Button>
                                    {isEditing && (
                                        <Button
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="flex-1"
                                        >
                                            Batal
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-gray-900">
                        {/* Table Header */}
                        <div className="border-b border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Daftar Supplier
                            </h2>
                        </div>

                        {/* Table Content dengan scroll horizontal di mobile */}
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <Table>
                                    <colgroup>
                                        <col style={{ width: '56px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ minWidth: '220px' }} />
                                        <col style={{ minWidth: '280px' }} />
                                        <col style={{ width: '140px' }} />
                                    </colgroup>
                                    <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                                        <TableRow>
                                            <TableHead className="text-center font-semibold">No.</TableHead>
                                            <TableHead className="font-semibold">Kode</TableHead>
                                            <TableHead className="font-semibold">Nama Supplier</TableHead>
                                            <TableHead className="font-semibold">Alamat</TableHead>
                                            <TableHead className="text-center font-semibold">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                                    Tidak ada data supplier
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentData.map((item: any, index: number) => (
                                                <TableRow 
                                                    key={item.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                >
                                                    <TableCell className="text-center font-medium">
                                                        {startIndex + index + 1}
                                                    </TableCell>
                                                    <TableCell 
                                                        className="font-mono text-sm font-semibold"
                                                        title={item.kode_supplier}
                                                    >
                                                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                                            {item.kode_supplier}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell title={item.nama_supplier}>
                                                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                                            {item.nama_supplier}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell title={item.alamat}>
                                                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                                            {item.alamat}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1.5 justify-center">
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
                                                                className="px-2 py-1 text-xs h-7"
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                                        router.delete(route('supplier.destroy', item.id));
                                                                    }
                                                                }}
                                                                className="px-2 py-1 text-xs h-7"
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

                        {/* Pagination */}
                        {suppliers.length > 0 && (
                            <div className="flex flex-col gap-4 border-t border-sidebar-border/70 p-4 dark:border-sidebar-border sm:flex-row sm:items-center sm:justify-between">
                                {/* Rows per page */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Baris per halaman:
                                    </span>
                                    <Select
                                        value={rowsPerPage.toString()}
                                        onValueChange={(value) => {
                                            setRowsPerPage(Number(value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Pagination info */}
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {paginationInfo}
                                </div>

                                {/* Pagination controls */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(1)}
                                        disabled={currentPage === 1}
                                        title="Halaman pertama"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        title="Halaman sebelumnya"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    
                                    <div className="flex items-center gap-1 px-2">
                                        <span className="text-sm font-medium">{currentPage}</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            / {totalPages}
                                        </span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        title="Halaman selanjutnya"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        title="Halaman terakhir"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}