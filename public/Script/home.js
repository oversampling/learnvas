//navbar
const body = document.querySelector("body");
const nav_toggle = document.querySelector("#toggle-btn");
const link_container = document.querySelector("nav ul");
nav_toggle.addEventListener("click", () => {
  link_container.classList.toggle("nav-show");
});

const userBtn = document.querySelector("#user");
const profileGroup = document.querySelector(".profileGroup")
userBtn.addEventListener("click", () => {
  if (profileGroup.classList.contains("show")){
    profileGroup.classList.remove("show");
    profileGroup.classList.add("hide");
  }else{
    profileGroup.classList.remove("hide");
    profileGroup.classList.add("show");
  }
})

//theme switcher
const modeSwitcher = document.querySelector(".mode-switcher");
const theme = localStorage.getItem("theme");
if (theme == "light") {
  body.classList.remove("dark");
  body.classList.add("light");
  modeSwitcher.textContent = "dark";
} else {
  body.classList.remove("light");
  modeSwitcher.textContent = "light";
  body.classList.add("dark");
}
modeSwitcher.addEventListener("click", () => {
  if (body.classList.contains("light")) {
    body.classList.add("dark");
    body.classList.remove("light");
    modeSwitcher.textContent = "light";
    localStorage.removeItem;
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.add("light");
    body.classList.remove("dark");
    modeSwitcher.textContent = "dark";
    localStorage.setItem("theme", "light");
  }
});

const auth = firebase.auth();
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const provider = new firebase.auth.GoogleAuthProvider();
const reviewForm = document.querySelector(".reviews form");

loginBtn.onclick = () => auth.signInWithPopup(provider);
logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(async user => {
  if (user) {
    loginBtn.style.display = "none";
    userBtn.style.display = "block";
    document.querySelector("#user img").setAttribute("src", user.photoURL);
    const questionForm = document.querySelector(".qa-section form");
    if (questionForm){
      questionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const questionInput = document.querySelector("#question-input");
        if (questionInput.value){
          axios.post("/question", { 
            email: user.email,
            question: questionInput.value,
            course: document.querySelector(".course-title").textContent
          }).then(response => {
            window.location = response.data.redirect;
          })
          questionInput.value = "";
        }
      })
    }
    if (reviewForm){
      reviewForm.innerHTML = `
      <form action="#" method="POST">
            <input type="text" name ="question" id="review-input">
            <button type="submit">Post <span>Reviews</span></button>
        </form>`
      reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const reviewInput = document.querySelector("#review-input");
        if (reviewInput.value){
          axios.post("/review", {
            email: user.email,
            review: reviewInput.value,
            course: document.querySelector(".course-title").textContent
          }).then(response => {
            window.location = response.data.redirect;
          })
        }
        reviewInput.value = ""
      })
    }
    try{
      await axios.post("/user", {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
      });
    }catch(e){
      console.error(e);
    }
  } else {
    loginBtn.style.display = "block";
    userBtn.style.display = "none";
    profileGroup.classList.add("hide");
    document.getElementById("user").style.display = "none";
    reviewForm.innerHTML = "<p>Login to post review</p>"
  }
});

