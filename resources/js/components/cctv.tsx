// components/CCTVFeed.tsx
export default function CCTV({ src }: { src: string }) {
  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
      <img src={src} alt="CCTV Feed" className="w-full h-full object-cover" />
    </div>
  );
}
