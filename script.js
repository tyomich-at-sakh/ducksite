
"use strict";

const STORAGE_KEY = "ducksite-progress-v1";

const defaultState = {
    feedCount: 0,
    quackCount: 0,
    petCount: 0,
    mood: "Любопытное",
    secrets: {
        feed: false,
        quack: false,
        pet: false
    }
};

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(defaultState);
        }

        const parsed = JSON.parse(saved);

        return {
            ...defaultState,
            ...parsed,
            feedCount: validCount(parsed.feedCount),
            quackCount: validCount(parsed.quackCount),
            petCount: validCount(parsed.petCount),
            secrets: {
                ...defaultState.secrets,
                ...(parsed.secrets || {})
            }
        };
    } catch {
        return structuredClone(defaultState);
    }
}

function validCount(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

let state = loadState();

const duck = document.getElementById("duck");
const duckEmoji = document.getElementById("duckEmoji");
const duckMessage = document.getElementById("duckMessage");

const feedCount = document.getElementById("feedCount");
const quackCount = document.getElementById("quackCount");
const mood = document.getElementById("mood");
const secretCount = document.getElementById("secretCount");
const secretMessage = document.getElementById("secretMessage");

const secretFeed = document.getElementById("secretFeed");
const secretQuack = document.getElementById("secretQuack");
const secretPet = document.getElementById("secretPet");

const feedButton = document.getElementById("feedButton");
const quackButton = document.getElementById("quackButton");
const petButton = document.getElementById("petButton");
const resetButton = document.getElementById("resetButton");

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        duckMessage.textContent =
            "Не удалось сохранить прогресс в этом браузере.";
    }
}

function updateDisplay() {
    feedCount.textContent = state.feedCount;
    quackCount.textContent = state.quackCount;
    mood.textContent = state.mood;

    const unlocked = Object.values(state.secrets).filter(Boolean).length;
    secretCount.textContent = `${unlocked} / 3`;

    secretFeed.textContent = state.secrets.feed
        ? "🔓 Первое угощение — открыто!"
        : "🔒 Первое угощение";

    secretQuack.textContent = state.secrets.quack
        ? "🔓 Первое кряканье — открыто!"
        : "🔒 Первое кряканье";

    secretPet.textContent = state.secrets.pet
        ? "🔓 Десять поглаживаний — открыто!"
        : "🔒 Десять поглаживаний";

    secretFeed.classList.toggle("unlocked", state.secrets.feed);
    secretQuack.classList.toggle("unlocked", state.secrets.quack);
    secretPet.classList.toggle("unlocked", state.secrets.pet);
}

function animateDuck() {
    duckEmoji.classList.remove("bounce");

    // Повторный запуск анимации при каждом действии.
    void duckEmoji.offsetWidth;

    duckEmoji.classList.add("bounce");
}

function showMessage(message) {
    duckMessage.textContent = message;
}

function unlockSecret(name, message) {
    if (state.secrets[name]) {
        return;
    }

    state.secrets[name] = true;
    secretMessage.textContent = message;
}

function feedDuck() {
    state.feedCount += 1;
    state.mood = "Счастливое";

    showMessage("Ням-ням! Спасибо за хлеб! 🍞");
    unlockSecret("feed", "🎉 Первый секрет открыт: ты угостил утку!");

    animateDuck();
    saveState();
    updateDisplay();
}

function quackDuck() {
    state.quackCount += 1;
    state.mood = "Возбуждённое";

    showMessage("Кря-кря-кря! 🗣️");
    unlockSecret("quack", "🎉 Второй секрет открыт: ты услышал первое кря!");

    animateDuck();
    saveState();
    updateDisplay();
}

function petDuck() {
    state.petCount += 1;
    state.mood = "Довольное";

    showMessage("Кря! Спасибо! ❤️");

    if (state.petCount >= 10) {
        unlockSecret("pet", "🏆 Все три секрета открыты! Ты настоящий друг утки!");
    }

    animateDuck();
    saveState();
    updateDisplay();
}

function resetProgress() {
    const confirmed = window.confirm(
        "Начать заново? Весь сохранённый прогресс этой утки будет сброшен."
    );

    if (!confirmed) {
        return;
    }

    state = structuredClone(defaultState);

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        showMessage("Не получилось очистить сохранённый прогресс.");
    }

    secretMessage.textContent =
        "У утки есть три секрета. Сможешь открыть их все?";

    showMessage("Кря! Начнём наше приключение заново!");
    updateDisplay();
}

feedButton.addEventListener("click", feedDuck);
quackButton.addEventListener("click", quackDuck);
petButton.addEventListener("click", petDuck);
resetButton.addEventListener("click", resetProgress);

function interactWithDuck() {
    petDuck();
}

duck.addEventListener("click", interactWithDuck);

duck.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        interactWithDuck();
    }
});

updateDisplay();

if (state.feedCount || state.quackCount || state.petCount) {
    showMessage("С возвращением! Я тебя помню! 🦆");
}
