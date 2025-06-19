// import { Link } from '@inertiajs/react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// // import { PaginatedData } from '@/types';

// interface PaginationProps {
//     data: PaginatedData<any>;
//     className?: string;
// }

// export default function Pagination({ data, className = '' }: PaginationProps) {
//     if (data.last_page <= 1) {
//         return null; // Don't show pagination if there's only one page
//     }

//     return (
//         <div className={`flex items-center justify-between px-2 py-4 border-t ${className}`}>
//             {/* Results Info */}
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <span>
//                     Menampilkan {data.from ?? 0} - {data.to ?? 0} dari {data.total} data
//                 </span>
//             </div>
            
//             {/* Pagination Controls */}
//             <div className="flex items-center gap-2">
//                 {/* Previous Button */}
//                 <Link
//                     href={data.prev_page_url || '#'}
//                     className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-colors ${
//                         data.prev_page_url 
//                             ? 'hover:bg-accent hover:text-accent-foreground border-input' 
//                             : 'opacity-50 cursor-not-allowed text-muted-foreground border-muted'
//                     }`}
//                     {...(!data.prev_page_url && { onClick: (e) => e.preventDefault() })}
//                 >
//                     <ChevronLeft className="h-4 w-4" />
//                     Previous
//                 </Link>

//                 {/* Page Numbers */}
//                 <div className="flex items-center gap-1">
//                     {data.links
//                         .filter(link => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
//                         .map((link, index) => (
//                             <Link
//                                 key={index}
//                                 href={link.url || '#'}
//                                 className={`px-3 py-2 text-sm rounded-md transition-colors ${
//                                     link.active
//                                         ? 'bg-primary text-primary-foreground'
//                                         : link.url
//                                         ? 'hover:bg-accent hover:text-accent-foreground border border-input'
//                                         : 'opacity-50 cursor-not-allowed text-muted-foreground'
//                                 }`}
//                                 {...(!link.url && { onClick: (e) => e.preventDefault() })}
//                                 dangerouslySetInnerHTML={{ __html: link.label }}
//                             />
//                         ))}
//                 </div>

//                 {/* Next Button */}
//                 <Link
//                     href={data.next_page_url || '#'}
//                     className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md border transition-colors ${
//                         data.next_page_url 
//                             ? 'hover:bg-accent hover:text-accent-foreground border-input' 
//                             : 'opacity-50 cursor-not-allowed text-muted-foreground border-muted'
//                     }`}
//                     {...(!data.next_page_url && { onClick: (e) => e.preventDefault() })}
//                 >
//                     Next
//                     <ChevronRight className="h-4 w-4" />
//                 </Link>
//             </div>
//         </div>
//     );
// }