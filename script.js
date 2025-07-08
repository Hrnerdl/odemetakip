
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("paymentForm");
  const dateInput = document.getElementById("date");
  const descInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const tableBody = document.querySelector("#paymentTable tbody");
  const totalDisplay = document.getElementById("total");
  const exportButton = document.getElementById("exportPDF");

  let payments = JSON.parse(localStorage.getItem("payments") || "[]");

  const savePayments = () => {
    localStorage.setItem("payments", JSON.stringify(payments));
  };

  const renderPayments = () => {
    payments.sort((a, b) => new Date(a.date) - new Date(b.date));
    tableBody.innerHTML = "";
    let total = 0;
    payments.forEach((p, index) => {
      const row = document.createElement("tr");
      const amount = parseFloat(p.amount.replace(",", "."));
      row.innerHTML = `
        <td>${p.date}</td>
        <td>${p.description}</td>
        <td>₺${amount.toFixed(2).replace(".", ",")}</td>
        <td><button onclick="deletePayment(${index})">Sil</button></td>
      `;
      tableBody.appendChild(row);
      total += amount;
    });
    totalDisplay.textContent = "₺" + total.toFixed(2).replace(".", ",");
  };

  window.deletePayment = (index) => {
    payments.splice(index, 1);
    savePayments();
    renderPayments();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const payment = {
      date: dateInput.value,
      description: descInput.value,
      amount: amountInput.value
    };
    payments.push(payment);
    savePayments();
    renderPayments();
    form.reset();
  });

  exportButton.addEventListener("click", () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Ödeme Takip Raporu", 14, 20);
    let y = 30;
    payments.forEach((p, i) => {
      const amount = parseFloat(p.amount.replace(",", ".")).toFixed(2).replace(".", ",");
      doc.text(`${p.date} - ${p.description} - ₺${amount}`, 14, y + i * 10);
    });
    const totalAmount = payments.reduce((acc, p) => acc + parseFloat(p.amount.replace(",", ".")), 0);
    doc.text(`Toplam: ₺${totalAmount.toFixed(2).replace(".", ",")}`, 14, y + payments.length * 10 + 10);
    doc.save("odeme_takip.pdf");
  });

  renderPayments();
});
