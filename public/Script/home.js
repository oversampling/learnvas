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
const logoutBtns = document.querySelectorAll(".logoutBtn");
const provider = new firebase.auth.GoogleAuthProvider();
const reviewForm = document.querySelector(".reviews form");

loginBtn.onclick = () => auth.signInWithPopup(provider);
for (let logoutBtn of logoutBtns){
  logoutBtn.onclick = () => {
    auth.signOut()
    location.href = "/";
  };
}

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
        const courseID = document.querySelector("#banner").dataset.courseId;
        const userID = document.querySelector("#banner").dataset.userId;
        alert(courseID)
        if (questionInput.value){
          axios.post("/question", { 
            userID,
            question: questionInput.value,
            courseID
          }).then(response => {
            window.location = response.data.redirect;
          })
          questionInput.value = "";
        }
      })
    }
    //TODO change search which course that review belong by using course id instead of course title
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
      var userID = await axios.post("/user", {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
      });
      userID = userID.data.userID;
      if (location.pathname.substring(1, userID.length + 1) !== userID){
        location.href = `/${userID}${location.pathname}`
      }
    }catch(e){
      console.error(e);
    }
    const paymentBtn = document.querySelector(".buy-btn");  
    if (paymentBtn){
      paymentBtn.addEventListener("click", (e) => {
        fetch("http://localhost:3000/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: { 
              id: paymentBtn.dataset.courseId/*1*/, quantity: 1 
            },
            otherDetail:{
              userID: userID, 
              courseID: paymentBtn.dataset.courseId
            }
          }),
        })
        .then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({ url, otherDetail }) => {
          window.location = url
        })
        .catch(e => {
          console.error(e.error)
        })
      })
    }
  } else {
    loginBtn.style.display = "block";
    userBtn.style.display = "none";
    profileGroup.classList.add("hide");
    document.getElementById("user").style.display = "none";
    reviewForm.innerHTML = "<p>Login to post review</p>";
    // location.href = "/"
  }
});

