const quotes = [
    {
        text: "The best way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
    },
    {
        text: "Success is not in what you have, but who you are.",
        author: "Bo Bennett"
    },
    {
        text: "Don’t let yesterday take up too much of today.",
        author: "Will Rogers"
    },
    {
        text: "It’s not whether you get knocked down, it’s whether you get up.",
        author: "Vince Lombardi"
    },
    {
        text: "If you can dream it, you can do it.",
        author: "Walt Disney"
    }
];

function generateQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);

    document.getElementById("quote").innerText = quotes[randomIndex].text;
    document.getElementById("author").innerText = "- " + quotes[randomIndex].author;
}