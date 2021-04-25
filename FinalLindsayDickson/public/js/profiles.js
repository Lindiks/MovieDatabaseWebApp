function deleteNotif(elm){
    let val = elm.value;
    console.log("attempt to delete notif - "+val);

    let url = window.location.href + "/Notifications";
    
    console.log(url);
    //Send ajax request 
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(this.responseText);
           console.log("success")
           let e = document.getElementById(elm.id);
           e.remove();
          
        }
        //maybe do an alert for if the user needs to login or if the user is already following said person 
    }

    req.open("PUT", url);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({notif: val}));
    // console.log(this)
    // // deleteEvents();


}



function deleteEvents(){
    // console.log("Deleting ")
var closebtns = document.getElementsByClassName("notifs");
var i;

for (i = 0; i < closebtns.length; i++) {
  closebtns[i].addEventListener("click", function() {
     
    // this.parentElement.style.display = 'none';
    // this.parentElement.remove();

   
//     console.log(this)
//     console.log(this.value);
//     // deleteNotif()
//     console.log(this.innerText);
//    console.log(this.innerHTML);
     this.remove();
//    this.
  });
}
}


deleteEvents()
