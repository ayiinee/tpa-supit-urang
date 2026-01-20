<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receive Note {{ $t->no_tiket }}</title>
    <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 24px; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
        .row { display: flex; gap: 16px; }
        .col { flex: 1; }
        .label { color: #6b7280; font-size: 12px; }
        .value { font-weight: 600; }
        .header { display:flex; justify-content: space-between; align-items:center; margin-bottom: 16px; }
        .title { font-size: 18px; font-weight: 700; }
        .print { font-size: 12px; color:#2563eb; text-decoration: underline; cursor: pointer; }
        table { width:100%; border-collapse: collapse; margin-top: 12px; }
        th,td { border:1px solid #e5e7eb; padding:8px; text-align:left; font-size: 14px; }
    </style>
    <script>
        function doPrint(){ window.print(); }
    </script>
    </head>
<body>
    <div class="header">
        <div class="title">Receive Note</div>
        <div class="print" onclick="doPrint()">Print</div>
    </div>
    <div class="card">
        <div class="row">
            <div class="col">
                <div class="label">No. Tiket</div>
                <div class="value">{{ $t->no_tiket }}</div>
            </div>
            <div class="col">
                <div class="label">Tanggal</div>
                <div class="value">{{ optional($t->tanggal)->format('Y-m-d') }}</div>
            </div>
            <div class="col">
                <div class="label">No. Polisi</div>
                <div class="value">{{ $t->no_polisi }}</div>
            </div>
        </div>
        <div class="row" style="margin-top:12px;">
            <div class="col">
                <div class="label">No. Lambung</div>
                <div class="value">{{ $t->no_lambung }}</div>
            </div>
            <div class="col">
                <div class="label">Nama Supir</div>
                <div class="value">{{ $t->nama_supir }}</div>
            </div>
            <div class="col">
                <div class="label">Jenis Sampah</div>
                <div class="value">{{ optional($t->sampah)->jenis_sampah }}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Berat Masuk (kg)</th>
                    <th>Berat Keluar (kg)</th>
                    <th>Netto (kg)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ number_format($t->berat_masuk, 2) }}</td>
                    <td>{{ $t->berat_keluar !== null ? number_format($t->berat_keluar, 2) : '-' }}</td>
                    <td>{{ $t->netto !== null ? number_format($t->netto, 2) : '-' }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>


