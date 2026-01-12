import JsBarcode from "jsbarcode";

/**
 * Print a grid of barcode labels suitable for thermal label printers like Xprinter XP-365B.
 *
 * Options:
 * - product: { id, name, sku, price }
 * - count: number of labels to print
 * - columns: number of columns per row
 * - labelWidthMm, labelHeightMm: label cell size in millimeters (default tuned for small labels)
 * - gapMm: gap between labels
 * - format: barcode format for JsBarcode (CODE128 default)
 *
 * This generates an HTML page with a grid of labels and opens the print dialog.
 */
export default async function printBarcodeGrid({
  product,
  count = 10,
  columns = 2,
  labelWidthMm = 38,
  labelHeightMm = 25,
  gapMm = 2,
  format = "CODE128",
}) {
  try {
    const rows = Math.ceil(count / columns);

    // Generate barcode images for each label
    const images = [];
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement("canvas");
      const barcodeValue = String(product?.sku || product?.id || "");
      JsBarcode(canvas, barcodeValue, {
        format,
        displayValue: false,
        width: 2,
        height: 50,
        margin: 0,
      });
      images.push(canvas.toDataURL("image/png"));
    }

    // Page CSS: compute container width in mm
    // We'll create a printable page with labels laid out in a grid. Users should set printer paper size to match label roll.
    const totalWidthMm = columns * labelWidthMm + (columns - 1) * gapMm;
    const totalHeightMm = rows * labelHeightMm + (rows - 1) * gapMm;

    const style = `
      @page { size: ${totalWidthMm}mm ${totalHeightMm}mm; margin: 0; }
      body { margin:0; padding:0; -webkit-print-color-adjust: exact; }
      .sheet { display: grid; grid-template-columns: repeat(${columns}, ${labelWidthMm}mm); grid-gap: ${gapMm}mm; width: ${totalWidthMm}mm; }
      .label { box-sizing: border-box; width: ${labelWidthMm}mm; height: ${labelHeightMm}mm; padding: 2mm; display:flex; flex-direction:column; justify-content:space-between; align-items:center; font-family: Arial, Helvetica, sans-serif; }
      .barcode-img { max-width: 100%; height: auto; object-fit: contain; }
      .prod-name { font-size: 9pt; text-align:center; margin-top:1mm; }
      .sku { font-size: 8pt; text-align:center; margin-top:1mm; }
      .price { font-size: 9pt; font-weight: bold; margin-top:1mm; }
    `;

    // Build HTML
    let labelsHtml = "";
    for (let i = 0; i < count; i++) {
      const img = images[i];
      labelsHtml += `
        <div class="label">
          <img class="barcode-img" src="${img}" alt="barcode" />
          <div class="prod-name">${escapeHtml(product?.name || "")}</div>
          <div class="sku">${escapeHtml(
            product?.sku || product?.id || ""
          )}</div>
          <div class="price">${
            product?.price ? Number(product.price).toFixed(0) + " сум" : ""
          }</div>
        </div>
      `;
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Labels</title>
          <style>${style}</style>
        </head>
        <body>
          <div class="sheet">
            ${labelsHtml}
          </div>
          <script>
            window.onload = function() { setTimeout(() => { window.print(); }, 300); };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert(
        "Не удалось открыть окно печати. Проверьте блокировку всплывающих окон."
      );
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } catch (err) {
    console.error("printBarcodeGrid error", err);
    alert("Ошибка при генерации сетки штрихкодов: " + (err.message || err));
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
