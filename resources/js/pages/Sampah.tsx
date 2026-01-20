import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, PageProps } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const totalPages = Math.ceil(sampahs.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = sampahs.slice(startIndex, endIndex);

    const paginationInfo = useMemo(() => {
        const start = sampahs.length === 0 ? 0 : startIndex + 1;
        const end = Math.min(endIndex, sampahs.length);
        return `Menampilkan ${start}-${end} dari ${sampahs.length}`;
    }, [startIndex, endIndex, sampahs.length]);

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
            <Head title="Data Sampah" />
            <div className="flex flex-1 flex-col gap-8 p-6">
                <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {isEditing ? 'Edit Sampah' : 'Tambah Sampah'}
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-xl border border-gray-200 bg-gray-50/60 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jenis_sampah" className="text-sm font-medium">
                                        Jenis Sampah
                                    </Label>
                                    <Input
                                        id="jenis_sampah"
                                        type="text"
                                        value={data.jenis_sampah}
                                        onChange={(e) => setData('jenis_sampah', e.target.value)}
                                        placeholder="Contoh: Organik"
                                        required
                                    />
                                    {errors.jenis_sampah && (
                                        <p className="text-sm text-red-600">{errors.jenis_sampah}</p>
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
                            Daftar Sampah
                        </h2>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="overflow-x-auto">
                                <Table className="min-w-full table-fixed">
                                    <colgroup>
                                        <col style={{ width: '56px' }} />
                                        <col style={{ width: 'auto' }} />
                                        <col style={{ width: '140px' }} />
                                    </colgroup>
                                    <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                                        <TableRow>
                                            <TableHead className="text-center font-semibold">No.</TableHead>
                                            <TableHead className="font-semibold">Jenis Sampah</TableHead>
                                            <TableHead className="text-center font-semibold">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                                    Tidak ada data sampah
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentData.map((item: any, index: number) => (
                                                <TableRow
                                                    key={item.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 divide-x divide-gray-100"
                                                >
                                                    <TableCell className="text-center font-medium">
                                                        {startIndex + index + 1}
                                                    </TableCell>
                                                    <TableCell className="text-gray-800 dark:text-gray-200">
                                                        {item.jenis_sampah}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-1.5">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="px-2 py-1 text-xs h-7"
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
                                                                className="px-2 py-1 text-xs h-7 bg-red-100 text-red-700 hover:bg-red-200"
                                                                onClick={() => {
                                                                    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                                        router.delete(route('sampah.destroy', item.id));
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

                            {sampahs.length > 0 && (
                                <div className="flex flex-col gap-4 border-t border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Baris per halaman: {rowsPerPage}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {paginationInfo}
                                    </div>
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
                                            title="Sebelumnya"
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
                                            title="Selanjutnya"
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
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
