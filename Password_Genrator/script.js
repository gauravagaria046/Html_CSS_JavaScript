const passwordField = document.getElementById("password");
const lengthSlider = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");

lengthSlider.addEventListener("input", () => {
    lengthValue.textContent = lengthSlider.value;
});

function generatePassword() {
    const length = lengthSlider.value;
    const hasUpper = document.getElementById("uppercase").checked;
    const hasLower = document.getElementById("lowercase").checked;
    const hasNumbers = document.getElementById("numbers").checked;
    const hasSymbols = document.getElementById("symbols").checked;

    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

    let allChars = "";
    if (hasUpper) allChars += upper;
    if (hasLower) allChars += lower;
    if (hasNumbers) allChars += numbers;
    if (hasSymbols) allChars += symbols;

    if (allChars === "") {
        alert("Please select at least one option!");
        return;
    }

    let password = "";
    for (let i = 0; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    passwordField.value = password;
}

function copyPassword() {
    passwordField.select();
    document.execCommand("copy");
    alert("Password copied!");
}