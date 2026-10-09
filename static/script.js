
const flashcard = document.querySelector(".flashcard");
const cardInner = document.querySelector(".card-inner");

const nextButton = document.querySelector("#next");
const previousButton = document.querySelector("#previous");

let currentCard = 0;
let cards = [];

// Переворот карточки
flashcard.addEventListener("click", () => {
    cardInner.classList.toggle("flipped");
});

// Загрузка карточек из API
fetch("/cards")
    .then(response => {
        if (!response.ok) {
            throw new Error("Не удалось загрузить карточки");
        }
        return response.json();
    })
    .then(data => {
        cards = data;
        showCard();
    })
    .catch(error => {
        console.error(error);
    });

// Отображение текущей карточки
function showCard() {
    if (cards.length === 0) {
        return;
    }

    const front = document.querySelector(".front");
    const back = document.querySelector(".back");

    front.textContent = cards[currentCard].front;
    back.textContent = cards[currentCard].back;

    // Новая карточка всегда лицевой стороной
    cardInner.classList.remove("flipped");
}

// Следующая карточка
nextButton.addEventListener("click", () => {
    if (cards.length === 0) return;

    currentCard++;

    if (currentCard >= cards.length) {
        currentCard = 0;
    }

    showCard();
});

// Предыдущая карточка
previousButton.addEventListener("click", () => {
    if (cards.length === 0) return;

    currentCard--;

    if (currentCard < 0) {
        currentCard = cards.length - 1;
    }

    showCard();
});

const addButton = document.querySelector("#add_card");
const addForm = document.querySelector("#add-form");
const cancelButton = document.querySelector("#cancel-add");

addButton.addEventListener("click", () => {
    addForm.classList.remove("hidden");
});

cancelButton.addEventListener("click", () => {
    addForm.classList.add("hidden");
});

const saveButton = document.querySelector("#save-card");
const frontInput = document.querySelector("#front-input");
const backInput = document.querySelector("#back-input");

saveButton.addEventListener("click", () => {
    const front = frontInput.value.trim();
    const back = backInput.value.trim();

    if (!front || !back) {
        alert("Заполни оба поля");
        return;
    }

    fetch("/cards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            front: front,
            back: back
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось сохранить карточку");
            }

            return response.json();
        })
        .then(newCard => {
            cards.push(newCard);
            currentCard = cards.length - 1;

            showCard();

            frontInput.value = "";
            backInput.value = "";
            addForm.classList.add("hidden");
        })
        .catch(error => {
            console.error(error);
            alert("Ошибка при сохранении карточки");
        });
});

