const cardsContainerPlanned = document.querySelector(
  ".cards-container__planed--items"
);
const cardsContainerReady = document.querySelector(
  ".cards-container__ready--items"
);
const openModalWindowButton = document.getElementById("button-modal");
const modalWindow = document.getElementById("modal-window");
const closeModalButton = document.getElementById("close-modal");
const createTaskButton = document.getElementById("create-task");
const modalForm = document.getElementById("modal-form");
const cards = document.querySelector(".card");
const BASE_URL = "http://localhost:4001/api";
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const loginFormContainer = document.querySelector(".login-form__container");
const startPageButtons = document.querySelector(".start-page");
const liveToast = document.getElementById("liveToast");
const toastBody = document.querySelector(".toast-body");
const profileBtn = document.getElementById("profile");
const navbar = document.querySelector(".navbar");
const content = document.querySelector(".content-box");
const logo = document.querySelector(".header__logo");
let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const routes = new Map([
  ["LOGIN", () => `${BASE_URL}/login`],
  ["SIGNUP", () => `${BASE_URL}/signup`],
  ["CARDS", (name) => `${BASE_URL}/cards/${name}`],
  ["NEW_CARD", () => `${BASE_URL}/addCard`],
  ["DELETE_CARD", (id) => `${BASE_URL}/card/delete/${id}`],
  ["TO_READY", (id) => `${BASE_URL}/editCard/${id}`],
]);

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
const addCardEventListener = async (event) => {
  event.preventDefault();
  let taskDescriptionInput = document.getElementById("task-description");
  let taskTitleInput = document.getElementById("task-title");
  let taskTitleValue = taskTitleInput.value;
  let taskDescriptionValue = taskDescriptionInput.value;
  const userObj = JSON.parse(localStorage.getItem("token"));
  const noItems = document.querySelector(".no-items-content");
  if (taskTitleValue.length == 0 || taskDescriptionValue == 0) {
    alert("Fill all inputs");
    return;
  } else {
    const newCardResponse = await addNewCard(
      userObj.name,
      taskTitleValue,
      taskDescriptionValue
    );
    let newTask = await newCardResponse.json();
    console.log(newTask);
    if (noItems) noItems.style.display = "none";

    if (newCardResponse.ok) {
      let card = `<div class="card" data-cardId=${newTask._id} id="card">
     <div class="card-body">
       <h5 class="card-title">${newTask.title}</h5>
       <p class="card-text">${newTask.description}</p>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" data-cardId=${
            newTask._id
          } ${newTask.checked ? "checked" : ""}>
          <label class="form-check-label" for="flexSwitchCheckDefault">${
            newTask.checked ? "Виконано" : "Заплановано"
          }</label>
        </div>
        <button type="button" class="btn btn-danger delete-card" data-id="${
          newTask._id
        }" id="delete-card" >
          Видалити
        </button>
     </div>
   </div>`;
      modalForm.reset();
      taskDescriptionValue = "";
      taskTitleValue = "";
      modalWindow.style.display = "none";
      cardsContainerPlanned.insertAdjacentHTML("beforeend", card);
    } else {
      const userObj = JSON.parse(localStorage.getItem("token"));
      showToast(userObj.name.toUpperCase(), newTask.message);
      return;
    }
    const deleteCardBtn = document.querySelectorAll("#delete-card");

    deleteCardBtn.forEach((item) => {
      item.addEventListener("click", deleteCardFunction, false);
    });
    const checkbox = document.querySelectorAll("#checbox");
    checkbox.forEach((item) =>
      item.addEventListener("click", (event) => console.log(event))
    );
  }
};
const createCardsFunction = (array, container) => {
  const mapedCardsArray = array.map((item) => {
    return `<div class="card" style="width: 18rem;" data-cardId=${
      item._id
    } id="card">
    <div class="card-body">
      <h5 class="card-title">${item.title}</h5>
      <p class="card-text">${item.description}</p>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="checkbox" data-cardId=${
          item._id
        } ${item.checked ? "checked" : ""}>
        <label class="form-check-label" for="checkbox">${
          item.checked ? "Виконано" : "Заплановано"
        }</label>
      </div>
        <button type="button" class="btn btn-danger delete-card" data-id="${
          item._id
        }" id="delete-card">
          Видалити
        </button>
    </div>
  </div>`;
  });
  container.insertAdjacentHTML("beforeend", mapedCardsArray);
};

const createCardsFromArray = async (name) => {
  const resp = await getCards(name);
  const noItemsImage = `<p class="no-items-content">Немає завдань, додайте, щоб побачити...<p>`;
  if (resp.ok) {
    let result = await resp.json();
    const reversedResult = result.reverse();
    if (result.length > 0) {
      const plannedTasksArr = reversedResult.filter(
        (item) => item.checked == false
      );
      const readyTasksArr = reversedResult.filter(
        (item) => item.checked == true
      );
      createCardsFunction(plannedTasksArr, cardsContainerPlanned);
      createCardsFunction(readyTasksArr, cardsContainerReady);
    } else {
      cardsContainerPlanned.insertAdjacentHTML("beforeend", noItemsImage);
    }
    const checkbox = document.querySelectorAll("#checkbox");
    checkbox.forEach((item) =>
      item.addEventListener("change", (event) => {
        addCardToReadyFunction(item.checked);
      })
    );
    const deleteCardBtn = document.querySelectorAll("#delete-card");
    if (deleteCardBtn) {
      deleteCardBtn.forEach((item) => {
        item.addEventListener("click", deleteCardFunction, false);
      });
    } else {
      console.log("no items");
    }
  }
};

openModalWindowButton.addEventListener("click", openModalListener, false);
createTaskButton.addEventListener("click", addCardEventListener, false);

const deleteCardFunction = async () => {
  event.preventDefault();
  const cards = document.querySelectorAll("#card");
  const currentTargetId = event.target.dataset.id;
  const userObj = JSON.parse(localStorage.getItem("token"));
  for (let card of cards) {
    if (card.dataset.cardid == currentTargetId) {
      const response = await removeCardFetch(currentTargetId);
      if (response.ok) {
        const result = await response.json();
        showToast(userObj.name, result.message);
        card.remove();
      } else {
        showToast(userObj.name, result.message);
        return;
      }
    }
  }
};

const addCardToReadyFetch = (id, isChecked) => {
  const getRoute = routes.get("TO_READY");
  const route = getRoute(id);

  const config = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ checked: isChecked }),
  };
  return fetch(route, config);
};

const addCardToReadyFunction = async (isChecked) => {
  event.preventDefault();
  const cards = document.querySelectorAll("#card");
  const currentTargetId = event.target.dataset.cardid;
  const userObj = JSON.parse(localStorage.getItem("token"));
  for (let card of cards) {
    if (card.dataset.cardid == currentTargetId) {
      const response = await addCardToReadyFetch(currentTargetId, isChecked);
      if (response.ok) {
        const result = await response.json();
        showToast(userObj.name, result.message);
        card.remove();
        if (isChecked) {
          cardsContainerReady.insertAdjacentElement("afterbegin", card);
        } else {
          cardsContainerPlanned.insertAdjacentElement("afterbegin", card);
        }
      } else {
        showToast(userObj.name, result.message);
        return;
      }
    }
  }
};

const removeCardFetch = (id) => {
  const getRoute = routes.get("DELETE_CARD");
  const route = getRoute(id);

  const config = {
    method: "DELETE",
  };
  return fetch(route, config);
};

const signInFunction = (userEmail, userPassword) => {
  const getRoute = routes.get("LOGIN");
  const route = getRoute();
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: userEmail, password: userPassword }),
  };
  return fetch(route, config);
};

const signUpFunction = (userName, userEmail, userPassword) => {
  const getRoute = routes.get("SIGNUP");
  const route = getRoute();
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: userName,
      email: userEmail,
      password: userPassword,
    }),
  };
  return fetch(route, config);
};

const getCards = (name) => {
  const getRoute = routes.get("CARDS");
  const route = getRoute(name);
  return fetch(route);
};

document.addEventListener("DOMContentLoaded", () => {
  const userObj = JSON.parse(localStorage.getItem("token"));
  const startPageButtons = document.querySelector(".start-page");

  if (!userObj) {
    navbar.style.display = "none";
    content.style.display = "none";
    logo.style.margin = "0 auto";
    loginButton.addEventListener("click", (event) => {
      createLoginForm(event);
    });
    signupButton.addEventListener("click", (event) => {
      createSignUpForm(event);
    });
  } else {
    startPageButtons.style.display = "none";
    profileBtn.innerText = `${userObj.name}`;
    profileBtn.addEventListener("mouseenter", (event) => {
      event.preventDefault();
      profileBtn.innerText = "Вихід";
    });
    profileBtn.addEventListener("mouseleave", (event) => {
      event.preventDefault();
      const userObj = JSON.parse(localStorage.getItem("token"));
      profileBtn.innerText = `${userObj.name}`;
    });
    createCardsFromArray(userObj.name);

    const message = "Вітаю";
    showToast(userObj.name.toUpperCase(), message);

    profileBtn.addEventListener("dblclick", exitFromProfile, false);
    const deleteCardBtn = document.querySelectorAll("#delete-card");
    deleteCardBtn.forEach((item) => {
      item.addEventListener("click", deleteCardFunction, false);
    });
  }
});

const showToast = (name, message) => {
  toastBody.innerText = `${message}, ${name}!`;
  let toast = new bootstrap.Toast(liveToast);
  toast.show();
};
const exitFromProfile = () => {
  event.preventDefault();
  const userObj = JSON.parse(localStorage.getItem("token"));
  localStorage.setItem("token", JSON.stringify(""));
  startPageButtons.style.display = "flex";
  navbar.style.display = "none";
  content.style.display = "none";
  logo.style.margin = "0 auto";
  const message = "Допобачення";
  showToast(userObj.name.toUpperCase(), message);
  loginButton.addEventListener("click", async (event) => {
    createLoginForm(event);
  });
};
const addNewCard = (userName, taskTitle, taskDescription) => {
  const getRoute = routes.get("NEW_CARD");
  const route = getRoute();
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: userName,
      title: taskTitle,
      description: taskDescription,
    }),
  };
  return fetch(route, config);
};

const createLoginForm = (event) => {
  event.preventDefault();
  startPageButtons.style.display = "none";
  loginFormContainer.style.display = "block";
  const loginForm = `
      <form class="login-form__container--item">
        <h1>Вхід</h1>
        <div class="input-group mb-3">
          <span class="input-group-text" >Ел.пошта</span>
          <input id="user-login-email" type="email" class="form-control" aria-label="Sizing example input" aria-describedby="user-email">
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text" >Пароль</span>
          <input type="password" class="form-control" aria-label="Sizing example input" id="user-login-password" aria-describedby="user-password">
        </div>
        <div class="login-form__container--item__buttons">
          <button type="button" class="btn btn-success" id="login">
            Ввійти
          </button>
          <button type="button" class="btn btn-danger" id="close-login-form">
            Скасувати
          </button>
        </div>
      </form>`;
  loginFormContainer.innerHTML = loginForm;
  const signinButton = document.getElementById("login");
  const closeLoginFormButton = document.getElementById("close-login-form");

  closeLoginFormButton.addEventListener("click", closeLoginForm, false);
  signinButton.addEventListener("click", authorization, false);
};

const closeLoginForm = (event) => {
  event.preventDefault();
  loginFormContainer.innerHTML = "";
  loginFormContainer.style.display = "none";
  startPageButtons.style.display = "flex";
  signupButton.addEventListener("click", (event) => {
    createSignUpForm(event);
  });
};

const authorization = async (event) => {
  const usersEmailInput = document.getElementById("user-login-email");
  const usersPasswordInput = document.getElementById("user-login-password");
  const usersEmailValue = usersEmailInput.value;
  const usersPasswordValue = usersPasswordInput.value;
  const message = "Заповніть всі поля";
  const wrongEmail = "Запишить ел.пошту правильно";
  const name = "будь-ласка";
  const wrongResponse = "Неправильна пошта чи пароль";
  event.preventDefault();
  if (usersEmailValue.length == 0 || usersPasswordValue.length == 0) {
    if (!usersEmailValue.match(mailformat)) {
      usersEmailInput.style.boxShadow = "3px 3px 3px red";
      showToast(name, wrongEmail);
      return;
    } else {
      usersEmailInput.style.border = "1px solid green";
      usersPasswordInput.style.border = "1px solid green";
      usersEmailInput.style.boxShadow = "3px 3px 3px green";
      usersPasswordInput.style.boxShadow = "3px 3px 3px green";
      showToast(name, message);
      return;
    }
  } else {
    const response = await signInFunction(usersEmailValue, usersPasswordValue);
    if (response.ok) {
      const result = await response.json();
      const token = result.token;
      const name = result.name;

      localStorage.setItem(
        "token",
        JSON.stringify({ token: token, name: name })
      );

      loginFormContainer.innerHTML = "";
      loginFormContainer.style.display = "none";
      navbar.style.display = "block";
      content.style.display = "block";
      logo.style.margin = "0 0 0 15px";
      profileBtn.innerText = `${result.name}`;
      createCardsFromArray(result.name);
      const message = "Вітаю";
      showToast(result.name.toUpperCase(), message);
      profileBtn.addEventListener("mouseenter", (event) => {
        event.preventDefault();
        profileBtn.innerText = "Вихід";
      });
      profileBtn.addEventListener("mouseleave", (event) => {
        event.preventDefault();
        profileBtn.innerText = `${userObj.name}`;
      });
      profileBtn.addEventListener("dblclick", exitFromProfile, false);
    } else {
      const result = await response.json();
      showToast(wrongResponse, result.message);
    }
  }
};

const createSignUpForm = (event) => {
  event.preventDefault();
  startPageButtons.style.display = "none";
  loginFormContainer.style.display = "block";
  const signUpForm = `
      <form class="login-form__container--item">
        <h1>Реєстрація</h1>
        <div class="input-group mb-3">
          <span class="input-group-text" >Ел.пошта</span>
          <input id="user-email" type="email" class="form-control" aria-label="Sizing example input" aria-describedby="user-email">
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text" >Ім'я</span>
          <input id="user-name" type="text" class="form-control" aria-label="Sizing example input" aria-describedby="user-name">
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text" >Пароль</span>
          <input type="password" class="form-control" aria-label="Sizing example input" id="user-password" aria-describedby="user-password">
          <button  id="show-password" class="show-hide-button active btn btn-info">Показати</button>
          <button id="hide-password"  class="show-hide-button btn btn-info">Приховати</button>
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text" >Підтвердити пароль</span>
          <input type="password" class="form-control" aria-label="Sizing example input" id="user-retry-password" aria-describedby="user-retry-password">
          <button id="show-retry-password" class="show-hide-button btn btn-info">Показати</button>
          <button id="hide-retry-password" class="show-hide-button active btn btn-info">Приховати</button>
        </div>
        <div class="login-form__container--item__buttons">
          <button type="button" class="btn btn-success" id="create-new-user">
            Ввійти
          </button> 
          <button type="button" class="btn btn-danger" id="close-login-form">
            Скасувати
          </button>
        </div>
      </form>`;
  loginFormContainer.innerHTML = signUpForm;
  const createNewUserButton = document.getElementById("create-new-user");
  const closeLoginFormButton = document.getElementById("close-login-form");

  closeLoginFormButton.addEventListener("click", closeLoginForm, false);
  createNewUserButton.addEventListener("click", registration, false);
  const form = document.querySelector(".login-form__container--item");

  form.addEventListener("click", (event) => {
    event.preventDefault();
    const showPswrdBtn = document.getElementById("show-password");
    const hidePswrdBtn = document.getElementById("hide-password");
    const showRetryPswrdBtn = document.getElementById("show-retry-password");
    const hideRetryPswrdBtn = document.getElementById("hide-retry-password");

    const usersPasswordInput = document.getElementById("user-password");
    const usersRetryPasswordInput = document.getElementById(
      "user-retry-password"
    );
    if (event.target == showPswrdBtn) {
      usersPasswordInput.type = "text";
      hidePswrdBtn.classList.add("active");
      showPswrdBtn.classList.remove("active");
    }
    if (event.target == hidePswrdBtn) {
      usersPasswordInput.type = "password";
      hidePswrdBtn.classList.remove("active");
      showPswrdBtn.classList.add("active");
    }
    if (event.target == showRetryPswrdBtn) {
      usersRetryPasswordInput.type = "text";
      showRetryPswrdBtn.classList.remove("active");
      hideRetryPswrdBtn.classList.add("active");
    }
    if (event.target == hideRetryPswrdBtn) {
      usersRetryPasswordInput.type = "password";
      showRetryPswrdBtn.classList.add("active");
      hideRetryPswrdBtn.classList.remove("active");
    }
  });
};

const registration = async (event) => {
  event.preventDefault();
  const usersEmailInput = document.getElementById("user-email");
  const usersPasswordInput = document.getElementById("user-password");
  const usersNameInput = document.getElementById("user-name");
  const usersRetryPasswordInput = document.getElementById(
    "user-retry-password"
  );
  const usersNameValue = usersNameInput.value;
  const usersEmailValue = usersEmailInput.value;
  const usersPasswordValue = usersPasswordInput.value;
  const usersRetryPasswordValue = usersRetryPasswordInput.value;
  const message = "Будь-ласка",
    name = "заповніть всі поля",
    retryPassword = "Введіть однакові паролі";

  if (usersEmailValue.length == 0 || usersPasswordValue.length == 0) {
    showToast(name, message);
    return;
  }

  if (usersRetryPasswordValue != usersPasswordValue) {
    showToast(retryPassword, message);
    usersRetryPasswordInput.style.borderBottom = "2px solid red";
    usersRetryPasswordValue = "";
    return;
  } else {
    const response = await signUpFunction(
      usersNameValue,
      usersEmailValue,
      usersPasswordValue
    );
    if (response.ok) {
      const result = await response.json();
      showToast(usersNameValue, result.message);
      createLoginForm(event);
      const usersLoginEmailInput = document.getElementById("user-login-email");
      const usersLoginPasswordInput = document.getElementById(
        "user-login-password"
      );
      const userLoginEmailValue = (usersLoginEmailInput.value =
        usersEmailValue);
      const userLoginPasswordValue = (usersLoginPasswordInput.value =
        usersPasswordValue);
    } else {
      return response.json();
    }
  }
};
