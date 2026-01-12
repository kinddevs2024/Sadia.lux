import JsBarcode from "jsbarcode";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Print a barcode for a product. Accepts either { product } or { value, label }.
export default async function printBarcode({
  product,
  value,
  label,
  format = "CODE128",
  width = 2,
  height = 60,
}) {
  try {
    // Resolve fields
    const barcodeValue =
      (product && (product.sku || product.id)) || value || "";
    const productName = (product && product.name) || label || "";
    const price = product && product.price ? Number(product.price) : null;
    const sku = (product && product.sku) || String(barcodeValue || "");
    const size =
      product && (product.size || product.sizeValue || product.selectedSize);

    // Create canvas and render barcode (no human-readable text on canvas — we'll show SKU separately)
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, String(barcodeValue || ""), {
      format,
      displayValue: false,
      fontSize: 12,
      width: Math.max(1, width),
      height: Math.max(36, height),
      margin: 0,
    });

    const dataUrl = canvas.toDataURL("image/png");

    // Compose HTML with richer layout: left large size, right product name, barcode, sku, price
    const nameHtml = productName
      ? `<div class="prod-name">${escapeHtml(productName)}</div>`
      : "";
    const skuHtml = sku ? `<div class="sku">${escapeHtml(sku)}</div>` : "";
    const priceHtml =
      price !== null
        ? `<div class="price">${Number(price).toLocaleString()} сум</div>`
        : "";
    const sizeHtml = size
      ? `<div class="size">${escapeHtml(String(size))}</div>`
      : "";

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Barcode</title>
          <style>
            @page { size: 2.28in 1.18in landscape; margin: 0; }
            html, body { width: 2.28in; height: 1.18in; margin: 0; padding: 0; }
            body { font-family: Arial, Helvetica, sans-serif; display:flex; align-items:center; justify-content:center; }
            .sheet { width: 100%; height: 100%; display:flex; }
            .left { width: 26%; display:flex; align-items:center; justify-content:center; }
            .left .size { font-size: 34px; font-weight:700; }
            .right { width: 74%; padding: 6px 8px; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; }
            .prod-name { font-size: 11px; font-weight:700; text-align:center; margin-bottom:4px; }
            .barcode-img { display:block; margin: 0 auto; max-width: 100%; height: 36px; }
            .sku { text-align:center; font-size:10px; margin-top:4px; }
            .price { text-align:center; font-size:14px; font-weight:800; margin-top:4px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="left">${sizeHtml}</div>
            <div class="right">
              ${nameHtml}
              <img class="barcode-img" src="${dataUrl}" alt="barcode" />
              ${skuHtml}
              ${priceHtml}
            </div>
          </div>
          <script>
            window.onload = function() { setTimeout(()=>{ window.print(); }, 250); };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=400,height=300");
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
    console.error("printBarcode error", err);
    alert("Ошибка при генерации штрихкода: " + (err.message || err));
  }
}
