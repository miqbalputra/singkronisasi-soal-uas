export default function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'DRAFT':
      return <span className="badge badge-draft">Belum Ada Dokumen</span>
    case 'PROCESS':
      return <span className="badge badge-process">Sedang Proses</span>
    case 'READY_TO_PRINT':
      return <span className="badge badge-ready">Siap Print</span>
    case 'PRINTING':
      return <span className="badge badge-printing">Proses Cetak</span>
    case 'PRINTED':
      return <span className="badge badge-printed">Sudah Cetak</span>
    default:
      return null
  }
}
