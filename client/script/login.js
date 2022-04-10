const BASE_URL = "http://localhost:4001/api";
const loginButton = document.getElementById("login-button");
const content = document.querySelector(".login-form__container");
const startPageButtons = document.querySelector(".start-page");
const routes = new Map([
  ["LOGIN", () => `${BASE_URL}/login`],
  ["SIGNUP", () => `${BASE_URL}/signup`],
  ["CARD", (id) => `${BASE_URL}/cards/${id}`],
]);

loginButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const navbar = document.querySelector(".navbar");
  const logo = document.querySelector(".header__logo");
  startPageButtons.style.display = "none";
  content.style.display = "block";
  const loginForm = `
  <form class="login-form__container--item">
    <h1>Вхід</h1>
    <div class="input-group mb-3">
      <span class="input-group-text" >Ел.пошта</span>
      <input id="user-email" type="email" class="form-control" aria-label="Sizing example input" aria-describedby="user-email">
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" >Пароль</span>
      <input type="password" class="form-control" aria-label="Sizing example input" id="user-password" aria-describedby="user-password">
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
  content.innerHTML = loginForm;
  const signinButton = document.getElementById("login");
  const closeLoginFormButton = document.getElementById("close-login-form");
  const usersEmailInput = document.getElementById("user-email");
  const usersPasswordInput = document.getElementById("user-password");

  closeLoginFormButton.addEventListener("click", (event) => {
    event.preventDefault();
    content.innerHTML = "";
    content.style.display = "none";
    startPageButtons.style.display = "flex";
  });

  signinButton.addEventListener("click", async (event) => {
    const usersEmailValue = usersEmailInput.value;
    const usersPasswordValue = usersPasswordInput.value;
    event.preventDefault();
    if (usersEmailValue.length == 0 || usersPasswordValue.length == 0) {
      console.log("заповніть всі поля");
      return;
    } else {
      const response = await signInFunction(
        usersEmailValue,
        usersPasswordValue
      );
      if (response.ok) {
        const result = await response.json();
        const token = result.token;
        const name = result.name;
        const profileBtn = document.getElementById("profile");
        localStorage.setItem("token", { token: token, name: name });
        profileBtn.innerText = `${result.name}`;
      }
    }
  });
});

const signInFunction = (userEmail, userPassword) => {
  event.preventDefault();
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
