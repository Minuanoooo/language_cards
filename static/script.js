
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
    const front = document.querySelector(".front");
    const back = document.querySelector(".back");
    cardInner.classList.remove("flipped");
    if (cards.length === 0) {
        front.textContent = "Добавь первую карточку";
        back.textContent = "";
        return;
    }

    front.textContent = cards[currentCard].front;
    back.textContent = cards[currentCard].back;
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
const frontInput = document.querySelector("#front-input");
const backInput = document.querySelector("#back-input");
const editButton = document.querySelector("#edit-card");
let isEditing = false;
let editingCardId = null;

editButton.addEventListener("click", () => {
    if (cards.length === 0) return;

    isEditing = true;
    editingCardId = cards[currentCard].id;

    frontInput.value = cards[currentCard].front;
    backInput.value = cards[currentCard].back;

    addForm.classList.remove("hidden");
});

const saveButton = document.querySelector("#save-card");


saveButton.addEventListener("click", () => {
    const front = frontInput.value.trim();
    const back = backInput.value.trim();

    if (!front || !back) {
        alert("Заполни оба поля");
        return;
    }

    const url = isEditing
        ? `/cards/${editingCardId}`
        : "/cards";

    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ front, back })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось сохранить карточку");
            }
            return response.json();
        })
        .then(savedCard => {
            if (isEditing) {
                const index = cards.findIndex(
                    card => card.id === editingCardId
                );

                if (index !== -1) {
                    cards[index] = savedCard;
                }
            } else {
                cards.push(savedCard);
                currentCard = cards.length - 1;
            }

            isEditing = false;
            editingCardId = null;

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

const deleteButton = document.querySelector("#delete");

deleteButton.addEventListener("click", () => {
    if (cards.length === 0) return;

    const cardId = cards[currentCard].id;

    fetch(`/cards/${cardId}`, {
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось удалить карточку");
            }

            cards.splice(currentCard, 1);

            if (currentCard >= cards.length) {
                currentCard--;
            }

            showCard();
        })
        .catch(error => {
            console.error(error);
            alert("Ошибка при удалении карточки");
        });
});
