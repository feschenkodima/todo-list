const cardsContainer = document.querySelector(".cards-container");
const openModalWindowButton = document.getElementById("button-modal");
const modalWindow = document.getElementById("modal-window");
const closeModalButton = document.getElementById("close-modal");
const createTaskButton = document.getElementById("create-task");
const modalForm = document.getElementById("modal-form");
const cardsArray = JSON.parse(localStorage.getItem("cards"));
const cards = document.querySelector(".card");

const openModalListener = (event) => {
  modalWindow.style.display = "flex";
  event.preventDefault();
  const modalForm = document.getElementById("modal-form");
  window.addEventListener("click", (event) => {
    event.preventDefault();
    if (event.target == modalWindow || event.target == closeModalButton) {
      modalForm.reset();
      modalWindow.style.display = "none";
    }
  });
};
const addCardEventListener = (event) => {
  event.preventDefault();
  let taskDescriptionInput = document.getElementById("task-description");
  let taskTitleInput = document.getElementById("task-title");
  let taskTitleValue = taskTitleInput.value;
  let taskDescriptionValue = taskDescriptionInput.value;
  if (taskTitleValue.length == 0 || taskDescriptionValue == 0) {
    alert("Fill all inputs");
    return;
  } else {
    const newTask = new Task(taskTitleValue, taskDescriptionValue);
    let card = `<div class="card" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title">${newTask.title}</h5>
      <p class="card-text">${newTask.description}</p>
        <button type="button" class="btn btn-danger" id="delete-card">
          Delete
        </button>
    </div>
  </div>`;
    modalForm.reset();
    taskDescriptionValue = "";
    taskTitleValue = "";
    modalWindow.style.display = "none";

    cardsContainer.insertAdjacentHTML("afterbegin", card);
    cardsArray.push(newTask);
    localStorage.setItem("cards", JSON.stringify(cardsArray));
  }
};
class Task {
  constructor(title, description) {
    this.title = title;
    this.description = description;
  }
}
const createCardsFromArray = (array) => {
  const mapedCardsArray = array.map((item) => {
    return `<div class="card" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title">${item.title}</h5>
      <p class="card-text">${item.description}</p>
        <button type="button" class="btn btn-danger" id="delete-card">
          Delete
        </button>
    </div>
  </div>`;
  });
  cardsContainer.insertAdjacentHTML("afterbegin", mapedCardsArray);
};
openModalWindowButton.addEventListener("click", openModalListener, false);
createTaskButton.addEventListener("click", addCardEventListener, false);

const deleteCardFunction = (card) => {
  console.log(card);
};

document.addEventListener(
  "DOMContentLoaded",
  createCardsFromArray(cardsArray.reverse()),
  console.log(cards)
);
