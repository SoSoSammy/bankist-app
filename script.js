"use strict";

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Display the withdrawals and deposits
const displayMovements = function (movements, sort = false) {
  // Empty the already existing HTML from the container
  containerMovements.innerHTML = "";

  // If sort = true, sort the movements array in ascending order (will appear as descending)
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  // Loop through the movements array and create a new movements row for each movement
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
        </div>
    `;

    // Insert the new movements row at the top of the container
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Calculate the balance of the account
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  // Add up all deposits
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  // Add up all withdrawals and take the absolute value of it
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  // Get deposits then add interest on them and add them up
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * (acc.interestRate / 100))
    // Filter out any interest that is less than 1
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

// Create usernames for each account
const createUsernames = function (accs) {
  // Loop through the accounts array and create a new username for each account
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      // Separate each name (first, middle, last) from the name
      .split(" ")
      // Take the first letter of each name
      .map(name => name[0])
      // Join the first letters of each name together
      .join("");
  });
};
createUsernames(accounts);

// Update the UI
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Event handlers
let currentAccount;

btnLogin.addEventListener("click", function (e) {
  // Prevent form submission and page refresh
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  // If the currentAccount exists, check the pin
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display welcome message and UI
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0] // First name of the owner
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields and remove focus
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginUsername.blur();
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

// Transfer money to another account
btnTransfer.addEventListener("click", function (e) {
  // Prevent form submission and page refresh
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // Clear input fields
  inputTransferAmount.value = inputTransferTo.value = "";

  // If the amount is greater than 0, the receiver accont exists, and the current account has enough money, then transfer the money
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

// Request a loan
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  // If there is any deposit that is greater than or equal to 10% of the requested loan amount, then grant the loan
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }

  // Clear input field
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  // If username and pin is correct
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;

    // Reset welcome message
    labelWelcome.textContent = "Log in to get started";
  }

  // Clear input fields
  inputCloseUsername.value = inputClosePin.value = "";
});

// Sort movements
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  // When sorted is false, then we want to sort the movements
  // If the movements are already sorted, then we want to return them to their original order
  displayMovements(currentAccount.movements, !sorted);
  // Flip the sorted variable
  sorted = !sorted;
});
