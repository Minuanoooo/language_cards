(() => {
    "use strict";

    // Страница и API размещены на одном домене, поэтому используем относительные URL.
    const API_BASE = "";
    const TOKEN_KEY = "language_cards_access_token";

    const $ = (selector) => document.querySelector(selector);
    const flashcard = $(".flashcard");
    const cardInner = $(".card-inner");
    const frontElement = $(".front");
    const backElement = $(".back");
    const messageElement = $("#message");
    const authPanel = $("#auth-panel");
    const mainPanel = $("#main");
    const authForm = $("#auth-form");
    const authEmail = $("#auth-email");
    const authPassword = $("#auth-password");
    const authSubmit = $("#auth-submit");
    const loginTab = $("#show-login");
    const registerTab = $("#show-register");
    const logoutButton = $("#logout");
    const nextButton = $("#next");
    const previousButton = $("#previous");
    const addButton = $("#add_card");
    const editButton = $("#edit-card");
    const deleteButton = $("#delete");
    const addForm = $("#add-form");
    const formTitle = $("#card-form-title");
    const frontInput = $("#front-input");
    const backInput = $("#back-input");
    const saveButton = $("#save-card");
    const cancelButton = $("#cancel-add");
    const cardCounter = $("#card-counter");

    let token = localStorage.getItem(TOKEN_KEY);
    let authMode = "login";
    let currentCard = 0;
    let cards = [];
    let isEditing = false;
    let editingCardId = null;
    let messageTimer = null;

    function showMessage(message, type = "error") {
        if (messageTimer) clearTimeout(messageTimer);
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.classList.remove("hidden");
        messageTimer = setTimeout(() => messageElement.classList.add("hidden"), 7000);
    }

    function clearMessage() {
        if (messageTimer) clearTimeout(messageTimer);
        messageElement.textContent = "";
        messageElement.className = "message hidden";
    }

    async function apiRequest(path, options = {}) {
        const headers = new Headers(options.headers || {});
        if (options.body && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
        if (token) headers.set("Authorization", `Bearer ${token}`);

        let response;
        try {
            response = await fetch(`${API_BASE}${path}`, {
                ...options,
                headers
            });
        } catch {
            throw new Error("Не удалось подключиться к серверу. Проверьте интернет и попробуйте ещё раз.");
        }

        if (response.status === 401) {
            clearSession();
            throw new Error("Сессия завершилась или данные для входа неверны. Войдите снова.");
        }

        if (!response.ok) {
            let detail = "";
            try {
                const data = await response.json();
                detail = data.detail || data.message || "";
                if (Array.isArray(detail)) {
                    detail = detail.map(item => item.msg || JSON.stringify(item)).join("; ");
                }
            } catch {
                // Сервер мог вернуть пустой ответ или не-JSON.
            }

            if (response.status === 409) {
                throw new Error(detail || "Аккаунт с такими данными уже существует.");
            }
            if (response.status === 400 || response.status === 422) {
                throw new Error(detail || "Проверьте введённые данные.");
            }
            if (response.status === 403) {
                throw new Error(detail || "У вас нет доступа к этому действию.");
            }
            throw new Error(detail || `Ошибка сервера (${response.status}). Попробуйте позже.`);
        }

        if (response.status === 204) return null;
        const text = await response.text();
        if (!text) return null;
        try { return JSON.parse(text); } catch { return null; }
    }

    function clearSession() {
        token = null;
        localStorage.removeItem(TOKEN_KEY);
        cards = [];
        currentCard = 0;
        closeCardForm();
        authPanel.classList.remove("hidden");
        mainPanel.classList.add("hidden");
        logoutButton.classList.add("hidden");
        showCard();
    }

    function setAuthenticated() {
        authPanel.classList.add("hidden");
        mainPanel.classList.remove("hidden");
        logoutButton.classList.remove("hidden");
    }

    function setAuthMode(mode) {
        authMode = mode;
        const isLogin = mode === "login";
        $("#auth-title").textContent = isLogin ? "Вход в аккаунт" : "Создать аккаунт";
        authSubmit.textContent = isLogin ? "Войти" : "Зарегистрироваться";
        authPassword.autocomplete = isLogin ? "current-password" : "new-password";
        loginTab.classList.toggle("active", isLogin);
        registerTab.classList.toggle("active", !isLogin);
        clearMessage();
    }

    async function loadCards() {
        const data = await apiRequest("/cards");
        cards = Array.isArray(data) ? data : [];
        if (currentCard >= cards.length) currentCard = Math.max(0, cards.length - 1);
        showCard();
    }

    function showCard() {
        cardInner.classList.remove("flipped");
        if (cards.length === 0) {
            frontElement.textContent = "Добавьте первую карточку";
            backElement.textContent = "";
            cardCounter.textContent = "Пока карточек нет";
            previousButton.disabled = true;
            nextButton.disabled = true;
            editButton.disabled = true;
            deleteButton.disabled = true;
            return;
        }

        const card = cards[currentCard];
        frontElement.textContent = card.front ?? "";
        backElement.textContent = card.back ?? "";
        cardCounter.textContent = `Карточка ${currentCard + 1} из ${cards.length}`;
        previousButton.disabled = false;
        nextButton.disabled = false;
        editButton.disabled = false;
        deleteButton.disabled = false;
    }

    function openNewCardForm() {
        isEditing = false;
        editingCardId = null;
        formTitle.textContent = "Новая карточка";
        saveButton.textContent = "Сохранить";
        frontInput.value = "";
        backInput.value = "";
        addForm.classList.remove("hidden");
        frontInput.focus();
    }

    function openEditCardForm() {
        if (!cards.length) return;
        const card = cards[currentCard];
        isEditing = true;
        editingCardId = card.id;
        formTitle.textContent = "Редактировать карточку";
        saveButton.textContent = "Сохранить изменения";
        frontInput.value = card.front ?? "";
        backInput.value = card.back ?? "";
        addForm.classList.remove("hidden");
        frontInput.focus();
    }

    function closeCardForm() {
        addForm.classList.add("hidden");
        frontInput.value = "";
        backInput.value = "";
        isEditing = false;
        editingCardId = null;
    }

    async function authenticate(email, password) {
        const result = await apiRequest(authMode === "login" ? "/login" : "/users", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        if (authMode === "register") {
            // Если регистрация не возвращает токен, сразу пробуем выполнить вход.
            const loginResult = await apiRequest("/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
            token = loginResult?.access_token;
        } else {
            token = result?.access_token;
        }

        if (!token) {
            throw new Error("Сервер не вернул access_token. Проверьте ответ API.");
        }

        localStorage.setItem(TOKEN_KEY, token);
        setAuthenticated();
        await loadCards();
        showMessage(authMode === "register" ? "Аккаунт создан. Вы вошли в систему." : "Вы успешно вошли.", "success");
        authPassword.value = "";
    }

    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage();
        const email = authEmail.value.trim();
        const password = authPassword.value;
        if (!email || !password) {
            showMessage("Введите электронную почту и пароль.");
            return;
        }

        authSubmit.disabled = true;
        try {
            await authenticate(email, password);
        } catch (error) {
            showMessage(error.message || "Не удалось выполнить вход.");
        } finally {
            authSubmit.disabled = false;
        }
    });

    loginTab.addEventListener("click", () => setAuthMode("login"));
    registerTab.addEventListener("click", () => setAuthMode("register"));

    logoutButton.addEventListener("click", () => {
        clearSession();
        clearMessage();
        showMessage("Вы вышли из аккаунта.", "success");
    });

    function flipCard() {
        if (cards.length) cardInner.classList.toggle("flipped");
    }
    flashcard.addEventListener("click", flipCard);
    flashcard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            flipCard();
        }
    });

    nextButton.addEventListener("click", () => {
        if (!cards.length) return;
        currentCard = (currentCard + 1) % cards.length;
        showCard();
    });

    previousButton.addEventListener("click", () => {
        if (!cards.length) return;
        currentCard = (currentCard - 1 + cards.length) % cards.length;
        showCard();
    });

    addButton.addEventListener("click", openNewCardForm);
    editButton.addEventListener("click", openEditCardForm);
    cancelButton.addEventListener("click", closeCardForm);

    addForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const front = frontInput.value.trim();
        const back = backInput.value.trim();
        if (!front || !back) {
            showMessage("Заполните обе стороны карточки.");
            return;
        }

        saveButton.disabled = true;
        const wasEditing = isEditing;
        try {
            const savedCard = await apiRequest(
                wasEditing ? `/cards/${encodeURIComponent(editingCardId)}` : "/cards",
                {
                    method: wasEditing ? "PUT" : "POST",
                    body: JSON.stringify({ front, back })
                }
            );

            if (wasEditing) {
                const index = cards.findIndex(card => card.id === editingCardId);
                if (index !== -1 && savedCard) cards[index] = savedCard;
                else await loadCards();
            } else if (savedCard) {
                cards.push(savedCard);
                currentCard = cards.length - 1;
            } else {
                await loadCards();
                currentCard = Math.max(0, cards.length - 1);
            }

            closeCardForm();
            showCard();
            showMessage(wasEditing ? "Карточка обновлена." : "Карточка добавлена.", "success");
        } catch (error) {
            showMessage(error.message || "Не удалось сохранить карточку.");
        } finally {
            saveButton.disabled = false;
        }
    });

    deleteButton.addEventListener("click", async () => {
        if (!cards.length) return;
        const card = cards[currentCard];
        if (!window.confirm("Удалить эту карточку?")) return;

        deleteButton.disabled = true;
        try {
            await apiRequest(`/cards/${encodeURIComponent(card.id)}`, { method: "DELETE" });
            cards.splice(currentCard, 1);
            if (currentCard >= cards.length) currentCard = Math.max(0, cards.length - 1);
            showCard();
            showMessage("Карточка удалена.", "success");
        } catch (error) {
            showMessage(error.message || "Не удалось удалить карточку.");
        } finally {
            deleteButton.disabled = false;
        }
    });

    // Начальное состояние. Если токен сохранён, пробуем восстановить сессию.
    showCard();
    if (token) {
        setAuthenticated();
        loadCards().catch((error) => {
            if (token) {
                authPanel.classList.remove("hidden");
                mainPanel.classList.add("hidden");
                logoutButton.classList.add("hidden");
            }
            showMessage(error.message || "Не удалось загрузить карточки.");
        });
    } else {
        setAuthMode("login");
    }
})();
