import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { posService } from "../../services/pos.service";
import printBarcode from "../../utils/printBarcode";

/**
 * QRCodeGenerator Component
 * Generate and print QR codes or barcodes for products
 * Useful for tagging physical products in store
 */
const QRCodeGenerator = ({ productId, productName, product, onClose }) => {
  const [format, setFormat] = useState("image");

  const generateMutation = useMutation({
    mutationFn: () => {
      // If barcode format, use printBarcode utility
      if (format === "barcode") {
        return Promise.resolve({ type: "barcode" });
      }
      // Otherwise generate QR code
      return posService.generateQRCode(productId, format);
    },
    onSuccess: (response) => {
      // Handle barcode generation
      if (format === "barcode") {
        if (product) {
          printBarcode({ product });
        } else {
          // Fallback if only productId and productName are provided
          printBarcode({
            value: productId,
            label: productName,
          });
        }
        return;
      }

      // Handle QR code image response
      if (format === "image" && response) {
        // response.data is arraybuffer; create blob URL
        try {
          const arrayBuffer = response.data;
          const blob = new Blob([arrayBuffer], { type: "image/png" });
          const url = URL.createObjectURL(blob);
          const printWindow = window.open("", "", "width=400,height=600");
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>${productName} QR Code</title>
                  <style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:white}img{max-width:300px;border:2px solid #333;padding:10px}</style>
                </head>
                <body>
                  <div style="text-align:center;padding:20px">
                    <h2>${productName}</h2>
                    <img src="${url}" alt="QR Code" />
                    <p style="margin-top:12px;font-size:14px"><strong>Product ID:</strong> ${productId}</p>
                  </div>
                  <script>window.onload=function(){window.print();setTimeout(()=>{window.URL.revokeObjectURL('${url}')}, 5000)}</script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        } catch (err) {
          console.error("Failed to render QR image response", err);
        }
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">QR код / Штрихкод</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Товар:</strong> {productName}
          </p>
          <p className="text-sm text-blue-900">
            <strong>ID:</strong> {productId}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Формат:
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="image"
                checked={format === "image"}
                onChange={(e) => setFormat(e.target.value)}
                className="mr-3"
              />
              <span>QR код (изображение)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="barcode"
                checked={format === "barcode"}
                onChange={(e) => setFormat(e.target.value)}
                className="mr-3"
              />
              <span>Штрихкод</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mb-3"
        >
          {generateMutation.isPending 
            ? "Генерация..." 
            : format === "barcode" 
              ? "📊 Сгенерировать штрихкод" 
              : "🖨️ Сгенерировать QR код"}
        </button>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
        >
          Отмена
        </button>

        {generateMutation.isPending && (
          <div className="text-center mt-4">
            <div className="animate-spin w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
            <p className="text-gray-600 text-sm mt-2">Генерация...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
