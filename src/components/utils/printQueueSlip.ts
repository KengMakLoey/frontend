import QRCode from "qrcode";

export const printQueueSlip = async (queue: {
  queueNumber: string;
  patientName: string;
  vn: string;
  departmentName?: string;
}) => {
  const queueStatusUrl = `${window.location.origin}/?vn=${queue.vn}`;
  const qrDataUrl = await QRCode.toDataURL(queueStatusUrl, { width: 200 });
  const logoUrl = `${window.location.origin}/logo.svg`;

  const issuedDate = new Date().toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const issuedTime = new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Sarabun', sans-serif;
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
      padding: 32px 28px;
      color: #1a1a1a;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .logo { width: 56px; height: 56px; filter: grayscale(100%); }
    .hospital-name { font-size: 20px; font-weight: 800; line-height: 1.4; }
    .hospital-sub { font-size: 13px; color: #555; }

    .divider { border: none; border-top: 1px solid #ccc; margin: 16px 0; }

    .date-label {
      text-align: center;
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    .queue-number {
      text-align: center;
      font-size: 96px;
      font-weight: 800;
      letter-spacing: 2px;
      line-height: 1;
      margin: 8px 0 4px;
    }

    .vn {
      text-align: center;
      font-size: 13px;
      color: #555;
      margin-bottom: 20px;
    }

    .info-wrap {
      display: flex;
      justify-content: center;
    }
    .info-table {
      border-collapse: collapse;
      font-size: 15px;
    }
    .info-table td {
      padding: 0 0 8px 0;
      vertical-align: top;
    }
    .info-table td.label {
      font-weight: 700;
      padding-right: 12px;
      white-space: nowrap;
    }
    .info-table td.colon {
      padding-right: 8px;
    }

    .qr-section { text-align: center; margin-top: 28px; }
    .qr-section img { width: 200px; height: 200px; }
    .qr-caption { font-size: 14px; margin-top: 12px; font-weight: 700; }
    .qr-note { font-size: 12px; color: #777; margin-top: 6px; }

    @media print {
      @page { margin: 0; size: A5 portrait; }
      body { width: 100%; max-width: 100%; }
    }
  </style>
</head>
<body>

  <div class="header">
    <img class="logo" src="${logoUrl}" alt="NKP Logo" />
    <div>
      <div class="hospital-name">โรงพยาบาลนครพิงค์</div>
      <div class="hospital-sub">Nakornping Hospital</div>
    </div>
  </div>


  <div class="date-label">หมายเลขคิว [ ${issuedDate}, ${issuedTime} ]</div>
  <div class="queue-number">${queue.queueNumber}</div>
  <div class="vn">VN${queue.vn.split("-").pop()}</div>


  <div class="info-wrap">
    <table class="info-table">
      <tr>
        <td class="label">ชื่อ-นามสกุล</td>
        <td class="colon">:</td>
        <td>${queue.patientName || "-"}</td>
      </tr>
      <tr>
        <td class="label">แผนก</td>
        <td class="colon">:</td>
        <td>${queue.departmentName || "-"}</td>
      </tr>
    </table>
  </div>

  <div class="qr-section">
    <img src="${qrDataUrl}" alt="QR Code" />
    <div class="qr-caption">แสกน QR Code เพื่อตรวจสอบสถานะคิว</div>
    <div class="qr-note">*หมายเหตุ หมายเลขคิวไม่มีผลกับลำดับการเรียกคิว</div>
  </div>

</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};