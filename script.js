
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("paymentForm");
  const dateInput = document.getElementById("date");
  const descInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const tableBody = document.querySelector("#paymentTable tbody");
  const totalDisplay = document.getElementById("total");

  let payments = JSON.parse(localStorage.getItem("payments") || "[]");

  const savePayments = () => {
    localStorage.setItem("payments", JSON.stringify(payments));
  };

  const renderPayments = () => {
    tableBody.innerHTML = "";
    let total = 0;
    payments.forEach((p, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.date}</td>
        <td>${p.description}</td>
        <td>₺${parseFloat(p.amount).toFixed(2)}</td>
        <td><button onclick="deletePayment(${index})">Sil</button></td>
      `;
      tableBody.appendChild(row);
      total += parseFloat(p.amount);
    });
    totalDisplay.textContent = "₺" + total.toFixed(2);
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

  renderPayments();
});
