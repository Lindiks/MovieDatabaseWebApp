


function togglePopup(){
   document.getElementById("popup-1").classList.toggle("active");
}

let loginF = document.getElementById("login");
let registerF = document.getElementById("register");
let btnF = document.getElementById("btn");

function register() {
   loginF.style.left = "-400px";
   registerF.style.left = "50px";
   btnF.style.left = "110px";
}

function login() {
   loginF.style.left = "50px";
   registerF.style.left = "450px";
   btnF.style.left = "0px";
}


function getNextPage(p){
    console.log(p)
    p = p+1;
    console.log(p)
    console.log("getting next page!")
    console.log(window.location.href)
    let s = window.location.href.split("&page=");
    console.log(s)
    url = s[0]+"&page="+p;
    // url =  "http://localhost:3000/movies/search/?title=&actor=&director=&writer=&page="+p

    console.log(url)
    window.location.href = url

}

// Functionality - navHeader.html

// put something for the user login / dropdown (should probably be in the render function/onLOad)
function isLoggedin(){
   let missingUserDiv = document.getElementById("missingUser");
   let curUserDiv = document.getElementById("curUser");
   //if the user is logged in: 
   missingUserDiv.style.display = "none";
   curUserDiv.style.display = "block";
}

// Maybe make use of the get search route within these functions to return your data 



function addAnotherWri(){
    let val = document.getElementsByName("writerINPUT")
    
    let curVal = val[0].value;
    if (curVal === ''){
        console.log("EMPTY Value");
        return
    }
    // console.log(checkVal(val));
    if(!checkVal(val)){
        console.log("invalid text from writer")
        return;
    }
    console.log("boo")
    let aDiv = document.getElementById("WritersAdd");
    let hiddenElm = document.createElement("input");
    hiddenElm.name = "writerINPUT";
    hiddenElm.type = "text";
    hiddenElm.value = curVal;
    // hiddenElm.disabled = true;
    hiddenElm.style.display = "none";
    aDiv.appendChild(hiddenElm);

    let List = document.getElementById("writerList") 
    let newElm = document.createElement("li");
    newElm.value = curVal;
    newElm.innerText = curVal;
    newElm.name = "writer"
    List.appendChild(newElm)
    val[0].value = ''
}

//Make the navSearchbar send the url /movies/search/Title=variable&Actor= 
function sendSearch(){
    console.log("sending search");
    let input = document.getElementById("searchField").value;
    console.log(input);
    let url = "http://localhost:3000/movies/search/?title=" + input;
    console.log(url);
    window.location.href = url;
}


//Unfollowing someone from the users page 
function unfollowPerson(clicked){
    console.log("getting id");
    console.log(clicked);
     let url = "http://localhost:3000/people/"+clicked+"/Updatefollowing";
    // // console.log(window.location.href);
    followPerson(url);

    //delete the element showcasing the unfollowed user 
    let old = document.getElementById(clicked); 
    // console.log(window.location.href + " vs " + "http://localhost:3000/people/"+clicked)
    if(window.location.href ==("http://localhost:3000/people/"+clicked)){
        console.log("same")
        old.innerText = "Follow"
    }else{
      old.remove();
    }
}

function unfollowUser(clicked){
    console.log("getting id");
    console.log(clicked);
     let url = "http://localhost:3000/users/"+clicked+"/Updatefollowing";
    // // console.log(window.location.href);
    followUser(url);
    //delete the element showcasing the unfollowed user
    let old = document.getElementById(clicked); 
    old.remove();

}

function removeWatchlist(clicked){
    console.log("getting id");
    console.log(clicked);
     let url = "http://localhost:3000/movies/"+clicked+"/Watchlist";
    // // console.log(window.location.href);
    UpdateWatchlist(url);
    //delete the element showcasing the unfollowed user
    let old = document.getElementById(clicked); 
    old.remove();

}

function ContributeStatus(){
    console.log("Contribute status change");
    //"/Profile/updateStatus"
    let url= window.location.href + "/updateStatus";
    console.log(url);
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 201){
        console.log(this.responseText);
        //will prob need some inner HTML to update 


    }
    //maybe do an alert for if the user needs to login or if the user is already following said person 
    }
    req.open("PUT", url);
    req.setRequestHeader("Content-Type", "application/json");
    req.send("okay")
    changeFollow()
    // location.reload();
}

//Sends an AJAX request to prompt the user to add said person to the follow list 
//could make this a general function that would evaluate whether to send /followPeople or /unfollowPeople
function followPerson(url){
    
    console.log("hi--");
    // console.log(window.location.href);
    // console.log(window.location.pathname);
    console.log(url);
    if(url === undefined){
        url = window.location.href + "/Updatefollowing";
    }
  
    console.log(url);
//Send ajax request 
let req = new XMLHttpRequest();
req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 201){
        // console.log(this.responseText);
       
    }
    //maybe do an alert for if the user needs to login or if the user is already following said person 
}
req.open("PUT", url);
req.setRequestHeader("Content-Type", "application/json");
req.send("okay")


// let btnText = document.getElementById("")
console.log(url);
// console.log(window.href);
// window.location.reload();
changeFollow()

}

function changeFollow(){
    if(document.getElementById("followState") !== null){
        let btnText = document.getElementById("followState");
        console.log("followState!")
        console.log(btnText.value);
        console.log(btnText.innerText);
        
        if (btnText.innerText=="follow") btnText.innerText = "unfollow";
        else btnText.innerText = "follow";
    }
    if(document.getElementById("watchState")!== null){
        console.log("watchState!")
        let btnText = document.getElementById("watchState");
        
        console.log(btnText.value);
        console.log(btnText.innerText);
        
        if (btnText.innerText=="Add to Watchlist") btnText.innerText = "Remove from Watchlist";
        else btnText.innerText = "Add to Watchlist";

    }

    if(document.getElementById("contributeState")!== null){
        console.log(" contributeState!")
        let btnText = document.getElementById("contributeState");
        
        console.log(btnText.value);
        console.log(btnText.innerText);
        
        if (btnText.innerText=="Not a contributing user") btnText.innerText = "Contributing user";
        else btnText.innerText = "Not a contributing user";

    }
}




function followUser(url){
    console.log("hi--");
    // console.log(window.location.href);
    // console.log(window.location.pathname);
  
    if(url === undefined){
        url = window.location.href + "/Updatefollowing";
    }
    console.log(url);
//Send ajax request 
let req = new XMLHttpRequest();
req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 201){
        console.log(this.responseText);
    }
    //maybe do an alert for if the user needs to login or if the user is already following said person 
}
req.open("PUT", url);
req.setRequestHeader("Content-Type", "application/json");
req.send("okay")

changeFollow()

}






function UpdateWatchlist(url) {
    console.log("attempt Watchlist update");
    state = document.getElementById("followState");
    // console.log(window.location.href);
    // console.log(window.location.pathname);
    
    if(url === undefined){
        url = window.location.href + "/Watchlist";
    }
    console.log(url);
    //Send ajax request 
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(this.responseText);
           console.log("success")
        }
        //maybe do an alert for if the user needs to login or if the user is already following said person 
    }

    req.open("PUT", url);
    req.setRequestHeader("Content-Type", "application/json");
    req.send("okay")
    changeFollow()
    // location.reload();
}






var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}

