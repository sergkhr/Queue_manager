/*on entry to the page, check if the user is logged in
if they are not, redirect to login page*/
function isLogged() {
    let token = localStorage.getItem("queueManagerToken");
    if (!token) {
        return false; 
    }
    let tokenPayload = decodeJwt(token); //decodeJwt is a function from toBackScript.js
    let decodedExp = tokenPayload.exp;
    if(isTokenExpired(decodedExp)){
        return false;
    }
    return true;
}
function checkLogin() {
    if (!isLogged()) {
        window.location.href = "loginScreen.html";
    }
}
checkLogin();


function showAccountInfo() {
    getUserByToken(localStorage.getItem("queueManagerToken")).then((data) => {
        $("#userLogin").text(data.login);
        $("#username").text(data.username);
    }).catch((err) => {
        console.error(err);
    });
}
showAccountInfo();


// sign out handler
$("#signOut").click(() => {
    localStorage.removeItem("queueManagerToken");
    window.location.href = "loginScreen.html";
});