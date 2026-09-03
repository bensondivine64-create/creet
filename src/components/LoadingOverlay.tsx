export default function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="h-10 w-10 border-3 border-blue border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-fg/70 mt-4">{label}</p>
    </div>
  );
}
