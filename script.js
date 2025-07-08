
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
        <td>${p.date}</td>
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
    doc.text("Ödeme Raporu", 14, 20);
    let y = 30;
    payments.forEach(p => {
      const amt = parseFloat(p.amount.replace(",", ".")).toFixed(2).replace(".", ",");
      doc.text(`${p.date} - ${p.description} - ${p.category} - ₺${amt}`, 14, y);
      y += 10;
    });
    doc.save("odeme_raporu.pdf");
  };

  document.getElementById("exportCSV").onclick = () => {
    let csv = "Tarih,Açıklama,Kategori,Tutar\n";
    payments.forEach(p => {
      csv += `${p.date},"${p.description}",${p.category},${p.amount}\n`;
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
