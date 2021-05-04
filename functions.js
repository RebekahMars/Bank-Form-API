/*Function Name: checkLogin()
Description: This function implements several checks to determine if the login input is valid.
It first gets the username value from the text input on the index.html page. If the 
username length is 0 or contains whitespace at position 0 of the input, it throws an 
error message. Otherwise, if there are no errors, the username is saved to the localStorage
as 'activeUser' (like a cookie) and a fetch method is called. The username is checked one more
time using the API fetch account end-point to check if the username exists within the API. If
it does not exist, an error message is thrown. Otherwise, the page switches to the transaction page.*/
function checkLogin()
{
    var username = document.getElementById("username").value;
    if(username.length <= 0 || username[0] == " ")
    {
        document.getElementById("login-error").innerHTML = "Please enter a username";
        document.getElementById("username").style.borderColor = "red";
    }
    else
    {
        localStorage.setItem('activeUser', username);

        fetch(`http://localhost:5000/api/accounts/${username}`, {
            method: "GET",
        })
        .then((response) => response.json())
        .then((data) => {
            if(data.user == undefined)
            {
                document.getElementById("login-error").innerHTML = "The user that you have entered does not exist";
                document.getElementById("username").style.borderColor = "red";
            }
            else
            {
                window.location.href='transactions.html';
            }
        })
        .catch((err) => {
            console.log(err);
        });
    }
}
/*Function Name: checkRegister()
Description: This function implements regex expressions and other checks to determine if user input 
is valid. The input is first checked against regex expressions to determine if the input is invalid (see regex
below). If the input is invalid, an error message is thrown. If the user input is valid, then a function call
to registerNewCall() is made with the input values to register a new user. The screen is then switched to the
login page.*/
function checkRegister()
{
    /*Regex: Expression checks if the input contains at least 8 alphanumeric characters*/
    var userRegex = /^[a-zA-Z0-9]{8,}$/;
    /*Regex: Expression checks if the input contains numerical characters only, allows 2 decimals*/
    var balanceRegex = /(\.)?\d+(\.\d*)?/g;
    /*Regex: Expression checks if the input contains whitespace characters or special characters*/
    var descriptionRegex = /(.|\s)*\S(.|\s)*/;

    document.getElementById("user-error").innerHTML = "";
    document.getElementById("balance-error").innerHTML = "";
    document.getElementById("description-error").innerHTML = "";
    document.getElementById("usernameEntry").style.borderColor = "black";
    document.getElementById("balanceEntry").style.borderColor = "black";
    document.getElementById("descriptionEntry").style.borderColor = "black";

    var username = document.getElementById("usernameEntry").value;
    var currency = document.getElementById("currencyEntry").value; 
    var description = document.getElementById("descriptionEntry").value;
    var startingBalance = document.getElementById("balanceEntry").value;

    var userTest = userRegex.test(username);
    var balanceTest = balanceRegex.test(startingBalance);
    var descriptionTest = descriptionRegex.test(description);

    if(userTest == true && balanceTest == true && descriptionTest == true)
    {
        if(startingBalance >= 50)
        {
            startingBalance = parseFloat(startingBalance).toFixed(2);
            registerNewUser(username, description, currency, startingBalance);
        }
    }
    else
    {
        if(userTest == false)
        {
            document.getElementById("user-error").innerHTML = "Please enter a valid username.";
            document.getElementById("usernameEntry").style.borderColor = "red";
        }
        if(balanceTest == false)
        {
            document.getElementById("balance-error").innerHTML = "Please enter a valid starting balance.";
            document.getElementById("balanceEntry").style.borderColor = "red";
        }
        if(descriptionTest == false)
        {
            document.getElementById("description-error").innerHTML = "Please enter a valid description.";
            document.getElementById("descriptionEntry").style.borderColor = "red";
        }
        if(startingBalance < 50)
        {
            document.getElementById("balance-error").innerHTML = "Please enter a balance over 50.";
            document.getElementById("balanceEntry").style.borderColor = "red";
        }
    }
}
/*Function Name: registerNewUser()
Description: This function takes in four values from the checkRegister() function and utilizes those four
values in the API fetch call. With the four values, the function creates a new user and adds it to the API
locally.*/
function registerNewUser(name, summary, moneyType, balanceStart)
{
    fetch("http://localhost:5000/api/accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user: name,
      description: summary,
      currency: moneyType,
      balance: balanceStart
    })
  })
    .then((response) => response.json())
    .then((data) => {
        window.location.href='index.html'
        console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
}
/*Function Name: populateTransactionTable()
Description: This function creates the transaction table of each user upon switching to the transaction
page. It grabs the activeUser value from the localStorage and utililizes the value in an API fetch call
to get the user account information. The table is then populated using the user account information elements*/
function populateTransactionTable()
{
    var user = localStorage.getItem('activeUser');
    let table = document.getElementById("transactions-table");
    let welcomeHeading = document.getElementById("welcome");
    welcomeHeading.append("Welcome User: " + user);
    let userBalanceDisplay = document.getElementById("userBalance");

    fetch(`http://localhost:5000/api/accounts/${user}`, {
            method: "GET",
        })
        .then((response) => response.json())
        .then((data) => {
            let element;
            userBalanceDisplay.append("Current Balance: " + data.currency + data.balance);
            for(let i =0; i < data.transactions.length; i++)
            {
                element = data.transactions;
                row = table.insertRow();
                let idCell = row.insertCell(0);
                let dateCell = row.insertCell(1);
                let textCell = row.insertCell(2);
                let amountCell = row.insertCell(3);

                idCell.innerHTML = element[i].id;
                var tempDate = element[i].date;
                var convertedDate = new Date(tempDate);
                dateCell.innerHTML = convertedDate.toLocaleDateString() + " " + convertedDate.toLocaleTimeString();
                textCell.innerHTML = element[i].object;
                amountCell.innerHTML = element[i].amount;
                selectRow();
            }
        })
        .catch((err) => {
            console.log(err);
        });
}
/*Function Name: createNewTransaction()
Description: This function allows for the transaction modal to be visible, ultimately allowing for
the user to create a new transaction for the activeUser since the modal is visible.*/
function createNewTransaction()
{
    let transactionModal = document.getElementById("transactionModal")
    transactionModal.style.visibility = "visible"
}
/*Function Name: submitNewTransaction() 
Description: This function ultimately allows for the user to create and submit a new transaction
to the API. The function gets the values from each input and checks to determine if each input is 
valid. If the input is not valid, an error message is thrown and a variable called valid is set 
to 0. If valid is not 0 (remains as it was initiated as, which was 1), then the function enters
the fetch API call to create the new transaction and add it to the API using the input values.*/
function submitNewTransaction()
{
    let valid = 1;
    let datetimeEntry = document.getElementById("dateEntry").value;
    let summaryEntry = document.getElementById("addDescriptionEntry").value;
    let amountEntry = document.getElementById("addBalanceEntry").value;

    document.getElementById("add-date-error").innerHTML = "";
    document.getElementById("dateEntry").style.borderColor = "black";
    document.getElementById("add-description-error").innerHTML = "";
    document.getElementById("addDescriptionEntry").style.borderColor = "black";
    document.getElementById("add-balance-error").innerHTML = "";
    document.getElementById("addBalanceEntry").style.borderColor = "black";

    /*Regex: checks if the input contains numerical values only and allows one decimal point. Also allows
    for a negative value to be in front of the input (optional)*/
    let amountCheck = /^-?[0-9]\d*(\.\d+)?$/;
    var amountTest = amountCheck.test(amountEntry);

    if(datetimeEntry.length <= 0)
    {
        document.getElementById("add-date-error").innerHTML = "Please enter a valid date.";
        document.getElementById("dateEntry").style.borderColor = "red";
        valid = 0;
    }
    if(summaryEntry.length <= 0)
    {
        document.getElementById("add-description-error").innerHTML = "Please enter a valid description.";
        document.getElementById("addDescriptionEntry").style.borderColor = "red";
        valid = 0;
    }
    if(amountEntry.length <= 0 || amountTest == false)
    {
        document.getElementById("add-balance-error").innerHTML = "Please enter a valid amount.";
        document.getElementById("addBalanceEntry").style.borderColor = "red";
        valid = 0;
    }
    if(amountTest == true && amountEntry == 0)
    {
        document.getElementById("add-balance-error").innerHTML = "You cannot have an amount value of 0.";
        document.getElementById("addBalanceEntry").style.borderColor = "red";
        valid = 0;
    }
    if(valid == 1)
    {
        var convertedDate = new Date(datetimeEntry).toISOString();
        amountEntry = parseFloat(amountEntry).toFixed(2);
        newTransaction(convertedDate, summaryEntry, amountEntry);
    }
}
/*Function Name: newTransaction()
Description: Takes in the three validated user inputs from the transaction modal and 
uses the API transaction end-point to create the new transaction and save it to the API.
The user is grabbed from the localStorage as before.*/
function newTransaction(newDate, newObject, newAmount)
{
    var user = localStorage.getItem('activeUser');
    fetch(`http://localhost:5000/api/accounts/${user}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      date: newDate,
      object: newObject,
      amount: newAmount
    })
  })
    .then((response) => response.json())
    .then((data) => {

        let transactionModal = document.getElementById("transactionModal");
        transactionModal.style.visibility = "hidden";
        window.location.href='transactions.html';
        console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
}
/*Function Name: cancelTransaction()
Description: This function occurs when the cancel transaction button is pressed, which makes
the transaction modal disappear and the window is switched to the transaction page. */
function cancelTransaction()
{
    let transactionModal = document.getElementById("transactionModal");
    transactionModal.style.visibility = "visible";
    window.location.href='transactions.html';
}
/*Function Name: selectRow()
Description: This function allows for the selection of rows within the transaction table. It 
listens for a click an then changes the className of the selected row to "selected". This allows
for multiple selection of rows in the table.*/
function selectRow()
{
    var transactionTable = document.getElementById("transactions-table");
    var cells = transactionTable.getElementsByTagName("td");
    var rows = transactionTable.getElementsByTagName("tr");

    for(let i = 0; i< cells.length; i++)
    {
        cells[i].onclick = function () {

            let cellRowIndex = this.parentNode.rowIndex;
            let selectedRow = rows[cellRowIndex];

            if(selectedRow.className == "selected")
            {
                selectedRow.style.backgroundColor = "";
                selectedRow.classList.remove("selected");
            }
            else
            {
                selectedRow.style.backgroundColor = "lavender";
                selectedRow.classList.add("selected");
            }
        }
    }
}
/*Function Name: deleteTransaction()
Description: This function allows for the selected row of the transaction table to be deleted.
It determines if the className is selected, gets the index of the selected row, and then deletes that
index from the transaction table. It gets the ID from the transaction table and also deletes it from the
API, so it will not appear in the table. Although the user can select multiple rows in the table, this function
only allows for the deletion of the row with the smallest index (one at a time)*/
function deleteTransaction()
{
    var transactionTable = document.getElementById("transactions-table");
    var cells = transactionTable.getElementsByTagName("td");
    var rows = transactionTable.getElementsByTagName("tr");

    for(let i = 0; i < rows.length; i++)
    {
        let individualRow = rows[i];

        if(individualRow.className == "selected")
        {
            let selectedIndex = individualRow.rowIndex;
            let transactionID = rows[selectedIndex].cells[0].innerHTML;
            deleteByID(transactionID);
            transactionTable.deleteRow(selectedIndex);
        }
    }
}
/*Function Name: deleteByID()
Description: The function allows for the deletion of a transaction by getting the activeUser
from the localStorage, and then calling the API delete transaction-id end-point to do so. This is
done in the transaction page.*/
function deleteByID(id)
{
    var user = localStorage.getItem('activeUser');
    fetch(`http://localhost:5000/api/accounts/${user}/transactions/${id}`, {
    method: "DELETE",
  })
    .then((data) => {
        console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
}
/*Function Name: deleteUser()
Description: This function deletes the user from the API. This function is called
in the transaction page*/
function deleteUser()
{
    var user = localStorage.getItem('activeUser');

    fetch(`http://localhost:5000/api/accounts/${user}`, {
    method: "DELETE",
  })
    .then((data) => {
        console.log(data);
        alert("The user has been deleted. Returning to Login page.");
        window.location.href='index.html';
    })
    .catch((err) => {
      console.error(err);
    });

}