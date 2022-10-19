// Logic variables
const BASE_API = "https://api.scryfall.com";

let boostersDrafted = 0;
let boosterCards = [];

// UI variables
let landingGetBoosterBtn = null;
let landingMyDeckBtn = null;

let boosterFetchBtn = null;
let boosterSaveAllBtn = null;
let boosterClearBtn = null;

let boostersDraftedText = null;

let boosterCardsContainer = null;
let loadingSplash = null;

// Bind functions
const bindUIElements = () => {
  landingGetBoosterBtn = document.querySelector("#landing-get-booster-btn");
  landingMyDeckBtn = document.querySelector("#landing-my-deck-btn");

  boosterFetchBtn = document.querySelector("#booster-fetch-btn");
  boosterSaveAllBtn = document.querySelector("#booster-save-all-btn");
  boosterClearBtn = document.querySelector("#booster-clear-btn");

  boosterCardsContainer = document.querySelector("#booster-cards");
  loadingSplash = document.querySelector("#loading-splash");
  boostersDraftedText = document.querySelector("#boosters-fetched-num");
}

//Event Listeners
const bindClickListeners = () => {
  landingGetBoosterBtn.addEventListener("click", async () => {
    window.scroll({ top: document.querySelector("#booster-draft-section").offsetTop, behavior: "smooth" });
    resetBoosterContainer();
    await getNewBooster();
    renderBooster();
  });

  boosterFetchBtn.addEventListener("click", async () => {
    resetBoosterContainer();
    await getNewBooster();
    renderBooster();
  });

  boosterClearBtn.addEventListener("click", () => {
    clearBooster();
    resetBoosterContainer();
  });
}

//Logic Helpers
const startLoading = () => {
  loadingSplash.classList.add("visible");
}

const stopLoading = () => {
  loadingSplash.classList.remove("visible");
}

const promiseTimeout = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time)
  })
}

const getBoosterQuery = () => {
  return [
    boostersDrafted % 4 === 3 ? "r:mythic" : "r:rare",
    't:"basic land"',
    "r:uncommon",
    "r:uncommon",
    "r:uncommon",
    "r:common",
    "r:common",
    "r:common",
    "r:common",
    "r:common",
    "r:common",
    "r:common",
    "r:common",
    "r:common",
    "r:common",
  ]
}

//Cast methods
const castResponseToCard = (data) => {
  return {
    id: `${btoa(data.name)}_${new Date().getTime()}`,
    name: data.name,
    power: data.power,
    toughness: data.toughness,
    colors: data.colors,
    image: data.image_uris?.large ?? "https://cards.scryfall.io/large/front/8/6/8625b50d-474d-46dd-af84-0b267ed5fab3.jpg?1616041637",
    manaCost: data["mana_cost"],
    rarity: data.rarity,
    type: data["type_line"]
  }
}

//Fetch Cards
const fetchRandomCard = async (query) => {
  let card = null;

  try {
    const response = await fetch(`${BASE_API}/cards/random${query ? `?q=${query}` : ""}`);

    if (response.ok) {
      const data = await response.json();
      card = castResponseToCard(data);
    }

    return card;
  } catch (error) {
    throw error;
  }
}

const fetchBooster = async () => {
  startLoading();
  const queries = getBoosterQuery();

  const fetchPromises = queries.map(async (query) => {
    let card = null;
    try {
      card = await fetchRandomCard(query);
    } catch (error) {
      console.error(error);
      console.error("Oops! unexpected error happens");
    } finally {
      return card;
    }
  });

  const cards = await Promise.all(fetchPromises);

  stopLoading();
  return cards;
}

//Booster services
const getNewBooster = async () => {
  boosterCards = await fetchBooster();
  boostersDrafted++;
}

const clearBooster = () => {
  boosterCards = [];
}
//Render Booster Functions
const createCardInfo = (card) => {
  const info = document.createElement("div");
  info.classList.add("card-info");

  info.innerHTML = `
    <div class="card-header">
      <h3> ${card.name} </h3>
      <p>
        ${card.power ?? "-"}/${card.toughness ?? "-"}
      </p>
      <p>
        ${card.rarity}
      </p>
    </div>
    <div class="card-buttons">
      ${card.inDeck ? '<button class="card-remove-btn"><i class="fa-solid fa-minus"></i></button>' : '<button class="card-add-btn"><i class="fa-solid fa-plus"></i></button>'}
    </div>
    <div class="card-footer">
      <p>
        ${card.type}
      </p>
    </div>
  `;

  return info;
}

const resetBoosterContainer = () => {
  const cardHolders = boosterCardsContainer.querySelectorAll(".card") || [];

  for (let i = 0; i < cardHolders.length; i++) {
    const holder = cardHolders[i];
    const img = holder.querySelector(".card-image img");

    holder.querySelector(".card-info")?.remove();

    img.src = "assets/images/mtg_back.png";
  }
}

const renderBooster = async () => {
  const cardHolders = boosterCardsContainer.querySelectorAll(".card") || [];

  boostersDraftedText.innerHTML = String(boostersDrafted).padStart(3, "0");

  for (let i = 0; i < cardHolders.length; i++) {
    const holder = cardHolders[i];
    const img = holder.querySelector(".card-image img");

    holder.querySelector(".card-info")?.remove()

    img.src = boosterCards[i]?.image;
    holder.appendChild(createCardInfo(boosterCards[i] ?? {}));

    await promiseTimeout(500);
  }

}



//Main function
window.addEventListener("load", () => {
  //Bind Elements and listeners
  bindUIElements();
  bindClickListeners();
});