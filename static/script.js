let editingId = null;

let allTransactions = [];

// ==========================
// SELECT HTML ELEMENTS
// ==========================

const expenseForm = document.getElementById("expenseForm");

const transactionTable = document.getElementById("transactionTable");

const totalIncome = document.getElementById("totalIncome");

const totalExpense = document.getElementById("totalExpense");

const balance = document.getElementById("balance");

const transactionCount = document.getElementById("transactionCount");

const searchInput = document.getElementById("searchInput");

const filterCategory = document.getElementById("filterCategory");

const filterType = document.getElementById("filterType");

const notification = document.getElementById("notification");

const exportBtn = document.getElementById("exportBtn");

const darkModeBtn = document.getElementById("darkModeBtn");


const title = document.getElementById("title");

const amount = document.getElementById("amount");

const category = document.getElementById("category");

const type = document.getElementById("type");

const date = document.getElementById("date");


expenseForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const transaction = {

        title: title.value,

        amount: amount.value,

        category: category.value,

        type: type.value,

        date: date.value

    };

    let url;

if (editingId === null) {

    url = "/add_transaction";

} else {

    url = `/update_transaction/${editingId}`;

}

    fetch(url, {

    method: "POST",

    headers: {

        "Content-Type": "application/json"

    },

    body: JSON.stringify(transaction)

})

.then(function(response){

    return response.json();

})

.then(function(data){

    expenseForm.reset();

    editingId = null;

    document.getElementById("addTransactionBtn").innerHTML =
    '<i class="fa-solid fa-plus"></i> Add Transaction';

    loadTransactions();

    showNotification(data.message);

})

.catch(function(error){

    showNotification("Unable to save transaction.");

})

});

function showNotification(message) {

    notification.textContent = message;

    notification.style.display = "block";
    notification.style.opacity = "1";

    setTimeout(function () {

        notification.style.opacity = "0";

        setTimeout(function () {
            notification.style.display = "none";
        }, 300);

    }, 3000);

}

function exportCSV() {

    let csv =
"Title,Amount,Category,Type,Date\n";

    allTransactions.forEach(function(transaction){

        csv += `${transaction.title},${transaction.amount},${transaction.category},${transaction.type},${transaction.date}\n`;

    });

    const blob = new Blob([csv], {

        type:"text/csv"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "transactions.csv";

    link.click();

}

function loadTransactions() {

    fetch("/transactions")

    .then(function(response) {

        return response.json();

    })

    .then(function(transactions) {

        allTransactions = transactions;

        transactionTable.innerHTML = "";

        let income = 0;

        let expense = 0;

        const searchText = searchInput.value.toLowerCase();

        const selectedCategory = filterCategory.value;

        const selectedType = filterType.value;

        const filteredTransactions = transactions.filter(function(transaction) {

    const matchesSearch =
        transaction.title.toLowerCase().includes(searchText);

    const matchesCategory =
        selectedCategory === "All" ||
        transaction.category === selectedCategory;

    const matchesType =
        selectedType === "All" ||
        transaction.type === selectedType;

    return matchesSearch &&
           matchesCategory &&
           matchesType;

});

if(filteredTransactions.length === 0){

    transactionTable.innerHTML = `
<tr>

<td colspan="6"
style="text-align:center;padding:30px;">

No transactions found.

</td>

</tr>
`;

return;

}

 filteredTransactions.forEach(function(transaction) {

     if (transaction.type === "Income") {

         income += Number(transaction.amount);

        } else {
            expense += Number(transaction.amount);
        }

const row = `
<tr>
    <td>${transaction.title}</td>
    <td>₦${Number(transaction.amount).toLocaleString(undefined, {

    minimumFractionDigits: 2,

    maximumFractionDigits: 2

})}
</td>
    <td>${transaction.category}</td>
    <td>${transaction.type}</td>
    <td>${transaction.date}</td>
    <td>
        <button
    class="edit-btn"
    data-id="${transaction.id}">
    Edit
    </button>

        <button
    class="delete-btn"
    data-id="${transaction.id}">
    Delete
    </button>
    </td>
</tr>
`;

transactionTable.innerHTML += row;

});

const currentBalance = income - expense;

totalIncome.textContent =`₦${income.toLocaleString(undefined, {
    minimumFractionDigits: 2,

    maximumFractionDigits: 2

})}`;

totalExpense.textContent = `₦${expense.toLocaleString(undefined, {

    minimumFractionDigits: 2,

    maximumFractionDigits: 2

})}`;

balance.textContent = `₦${currentBalance.toLocaleString(undefined, {

    minimumFractionDigits: 2,

    maximumFractionDigits: 2

})}`;

transactionCount.textContent = filteredTransactions.length;

})

.catch(function(error) {

    });

}

transactionTable.addEventListener("click", function(event) {

    if(event.target.classList.contains("edit-btn")) {

        const id = Number(event.target.dataset.id);
        
        const transaction = allTransactions.find(function(item){

            return item.id === id;

        });

        title.value = transaction.title;

        amount.value = transaction.amount;

        category.value = transaction.category;

        type.value = transaction.type;

        date.value = transaction.date;

        editingId = transaction.id;

        document.getElementById("addTransactionBtn").innerHTML =
       '<i class="fa-solid fa-pen"></i> Update Transaction';
    }

    if (event.target.classList.contains("delete-btn")) {

    const id = Number(event.target.dataset.id);

    const confirmDelete = confirm("Are you sure you want to delete this transaction?");

    if (!confirmDelete) {

    return;

}

    fetch(`/delete_transaction/${id}`, {

    method: "DELETE"

})

.then(function(response) {

    return response.json();

})

.then(function(data) {

    showNotification(data.message);

    loadTransactions();

})

.catch(function(error) {

});

}

});

searchInput.addEventListener("input", function () {

    loadTransactions();

});

filterCategory.addEventListener("change", function () {

    loadTransactions();

});

filterType.addEventListener("change", function () {

    loadTransactions();

});

exportBtn.addEventListener("click", function(){

    const confirmExport = confirm(
        "Do you want to export your transactions?"
    );

    if (!confirmExport) {

        return;

    }

    exportCSV();

});


// Restore saved theme
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");

    darkModeBtn.innerHTML =
    '<i class="fa-solid fa-sun"></i> Light Mode';

}

darkModeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        localStorage.setItem("theme", "dark");

        darkModeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i> Light Mode';

    } else {

        localStorage.setItem("theme", "light");

        darkModeBtn.innerHTML =
        '<i class="fa-solid fa-moon"></i> Dark Mode';

    }
});

loadTransactions();