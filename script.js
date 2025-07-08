document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("paymentForm");
  const date = document.getElementById("date");
  const desc = document.getElementById("description");
  const amount = document.getElementById("amount");
  const category = document.getElementById("category");
  const tableBody = document.getElementById("paymentTableBody");
  const totalDisplay = document.getElementById("total");
  const filterInput = document.getElementById("filterInput");

  let payments = JSON.parse(localStorage.getItem("payments") || "[]");

  function save() {
    localStorage.setItem("payments", JSON.stringify(payments));
  }

  // Tarih formatlama fonksiyonu
  function formatDate(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}.${year}`;
  }

  function render() {
    tableBody.innerHTML = "";
    let total = 0;
    const filtered = payments
      .filter(p => p.description.toLowerCase().includes(filterInput.value.toLowerCase()))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    filtered.forEach((p, i) => {
      const row = document.createElement("tr");
      const amt = parseFloat(p.amount.replace(",", "."));
      row.innerHTML = `
        <td>${formatDate(p.date)}</td>
        <td>${p.description}</td>
        <td>${p.category}</td>
        <td>₺${amt.toFixed(2).replace(".", ",")}</td>
        <td><button onclick="deletePayment(${i})" class="btn btn-sm btn-danger">Sil</button></td>
      `;
      tableBody.appendChild(row);
      total += amt;
    });
    totalDisplay.textContent = "₺" + total.toFixed(2).replace(".", ",");
  }

  window.deletePayment = (index) => {
    payments.splice(index, 1);
    save();
    render();
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    payments.push({
      date: date.value,
      description: desc.value,
      amount: amount.value,
      category: category.value
    });
    save();
    render();
    form.reset();
  });

  document.getElementById("toggleTheme").onclick = () => {
    document.body.classList.toggle("dark");
  };

  document.getElementById("exportPDF").onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Ödeme Raporu", 105, 15, { align: "center" });

    // Tablo başlıkları
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    const headers = ["Tarih", "Açıklama", "Kategori", "Tutar (₺)"];
    let startY = 30, startX = 14;
    headers.forEach((h, i) => {
      doc.text(h, startX + i * 45, startY);
    });

    doc.setFont(undefined, "normal");
    let y = startY + 10;
    payments.forEach(p => {
      const amt = parseFloat(p.amount.replace(",", ".")).toFixed(2).replace(".", ",");
      const row = [
        formatDate(p.date),
        p.description,
        p.category,
        `₺${amt}`
      ];
      row.forEach((cell, i) => {
        doc.text(cell, startX + i * 45, y);
      });
      y += 10;
      // Sayfa sonu kontrolü
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Toplam tutar
    let total = payments.reduce((sum, p) => sum + parseFloat(p.amount.replace(",", ".")), 0);
    doc.setFont(undefined, "bold");
    doc.text("Toplam", startX + 2 * 45, y);
    doc.text("₺" + total.toFixed(2).replace(".", ","), startX + 3 * 45, y);
    doc.save("odeme_raporu.pdf");
  };

  document.getElementById("exportCSV").onclick = () => {
    let csv = "Tarih,Açıklama,Kategori,Tutar\n";
    payments.forEach(p => {
      csv += `${formatDate(p.date)},"${p.description}",${p.category},${p.amount}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "odeme_raporu.csv";
    link.click();
  };

  filterInput.addEventListener("input", render);

  render();
});
