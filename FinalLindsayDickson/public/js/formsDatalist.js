console.log("contribute")
let mainList = []
let genreList = []

/*______________________________________________________________________
  Load data for Datalists
*/

const searchActors = async searchText =>{
    const res = await fetch('/people/search/');
    const states = await res.json();

    let matches = states
    mainList = matches

    let list = document.getElementById('pplList');
    let newList = document.createElement('datalist');
    newList.id = 'pplList';
    matches.forEach(elm => {
        let op = document.createElement("option");
        op.value=elm.Name;
        newList.appendChild(op);

    })
    list.parentNode.replaceChild(newList, list);
}

const getGenres = async searchtext =>{
    const res = await fetch('/search')
    const states = await res.json();
    let matches = states 
    console.log(matches)
    genreList = matches;

    let list = document.getElementById('genresList');
    let newList = document.createElement('datalist');
    newList.id = 'genresList';
    matches.forEach(elm => {
        // console.log(elm);
        let op = document.createElement("option");
        op.value=elm;
        newList.appendChild(op);

    })
    list.parentNode.replaceChild(newList, list);
}

const getGenresSearch = async searchtext =>{
    const res = await fetch('/search')
    const states = await res.json();
    let matches = states 
    console.log(matches)
    genreList = matches;

    let list = document.getElementById('genresList');
    let newList = document.createElement('select');
    newList.id = 'genresList';
    matches.forEach(elm => {
        // console.log(elm);
        let op = document.createElement("option");
        op.value=elm;
        newList.appendChild(op);

    })
    list.parentNode.replaceChild(newList, list);
}



/*__________________________
  Execute the data functions 
*/
if(window.location.href === "http://localhost:3000/Contribute"){
    getGenres()
    searchActors()
}

// if(window.location.href === "http://localhost:3000/Search"){
//     getGenresSearch()
//     searchActors()
// }



/*______________________________________________________________________
  Validation functions 
*/

//Checks to ensure the value entered matches a value in the genrelist
function checkgenreVal(val){
    // console.log('genre check')
    let genList = genreList.map(gen => gen.toLowerCase());
    let flag = true;
    // console.log(genList)
    for(let i = 0; i < val.length; i++){
        if(val[i].value === '' && i+1 === val.length){
        //    console.log("empty")
           break
           }
       if(genList.includes(val[i].value.toLowerCase())){
           // console.log("Found!");
           // val[i].value = toCamelCase(val[i].value);
           // flag = true;
       }else{
           flag = false;
       }
       if(!flag){
           return false
       }
       
   }
   return flag;

}

//checks to ensure the value entered matches a value in the peoplelist 
function checkVal(val){
    // console.log("check val")
   
    let names = mainList.map(person => person.Name.toLowerCase());
    let flag = true;
        
    for(let i = 0; i < val.length; i++){
         if(val[i].value === '' && i+1 === val.length){
            // console.log("empty")
            break
            }
        if(names.includes(val[i].value.toLowerCase())){
        }else{
            flag = false;
        }
        if(!flag){
            return false
        }
        
    }
    return flag;

}


/*______________________________________________________________________
  Add Another Field 
*/


function addAnotherGenre(){
    // console.log('adding another genre')
    let hiddenVal = '';
    let val = document.getElementsByName("genreINPUT");
    // console.log(val)
    let curVal = val[0].value;
    if (curVal === ''){
        console.log("EMPTY Value");
        return
    }
    if(!checkgenreVal(val)){
        console.log("invalid text from genre")
        
        val[0].value='';
        alert("Please enter a valid genre :)")
        
        return;
    }

    let aDiv = document.getElementById("GenreAdd");


    for(x in genreList){
       if(curVal.toLowerCase() === genreList[x].toLowerCase()){
           console.log("match")
           curVal = genreList[x];
          
       }
    }
    


    let List = document.getElementById("genreList") 
    let hiddenElm = document.createElement("input");
    hiddenElm.name = "genreINPUT";
    hiddenElm.type = "text";
    hiddenElm.value = curVal;
    hiddenElm.id = curVal;
    // hiddenElm.disabled = true;
    hiddenElm.style.display = "none";


    //maybe append the hiddenElm to the li so when it gets deleted 
    // aDiv.appendChild(hiddenElm); 
    
    let newElm = document.createElement("li");
    let ex = document.createElement("p");
   
    newElm.innerText = curVal;
   
     newElm.name = "genre";
    newElm.id = curVal
    
    ex.className = "close";
    // ex.innerHTML = "&times;";
    ex.appendChild(newElm)
    // newElm.appendChild(ex);
    newElm.appendChild(hiddenElm)

    // List.appendChild(newElm)
    List.appendChild(ex);
    val[0].value = '';
    events();
}


function addAnotherAct(){
    let val = document.getElementsByName("actorINPUT")
    
    let curVal = val[0].value;
    if (curVal === ''){
        console.log("EMPTY Value");
        return
    }
    // console.log(val[0].value)
    // console.log(checkVal(val));
    if(!checkVal(val)){
        console.log("invalid text from actor")
        val[0].value='';
        alert("Please enter a valid name :)")

        return;
    }
    let aDiv = document.getElementById("ActorsAdd");
    let List = document.getElementById("actorList") 
    let hiddenElm = document.createElement("input");
    hiddenElm.name = "actorINPUT";
    hiddenElm.type = "text";
    hiddenElm.value = curVal;
    hiddenElm.required;
    // hiddenElm.disabled = true;
    hiddenElm.style.display = "none";
    // aDiv.appendChild(hiddenElm);
    
    let newElm = document.createElement("li");
    newElm.value = curVal;
    newElm.innerText = curVal;
    newElm.name = "actor"
   
    let ex = document.createElement("p");
    
    ex.className = "close";
    // ex.innerHTML = "&times;";
    
    // newElm.appendChild(ex);
    ex.appendChild(newElm)
    newElm.appendChild(hiddenElm)


    List.appendChild(ex)
    val[0].value = ''
    events();
}



function addAnotherDir(){
    let val = document.getElementsByName("directorINPUT")
    let curVal = val[0].value;
    if (curVal === ''){
        console.log("EMPTY Value");
        return
    }
    // console.log(checkVal(val));
    if(!checkVal(val)){
        console.log("invalid text from director")
        val[0].value='';
        alert("Please enter a valid name :)")
        return;
    }
   
    
    let aDiv = document.getElementById("DirectorsAdd");
    let hiddenElm = document.createElement("input");
    hiddenElm.name = "directorINPUT";
    hiddenElm.type = "text";
    hiddenElm.value = curVal;
    // hiddenElm.disabled = true;
    hiddenElm.style.display = "none";

    // aDiv.appendChild(hiddenElm);



    let List = document.getElementById("directorList") 
  
    let newElm = document.createElement("li");
    newElm.value = curVal;
    newElm.innerText = curVal;
    newElm.name = "director"


    let ex = document.createElement("p");
    
    ex.className = "close";
    // ex.innerHTML = "&times;";
    
    // newElm.appendChild(ex);
    ex.appendChild(newElm);
    newElm.appendChild(hiddenElm)

    List.appendChild(ex)
    val[0].value = ''
    events();
}





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
        val[0].value='';
        alert("Please enter a valid name :)")
        return;
    }
 
    let aDiv = document.getElementById("WritersAdd");
    let hiddenElm = document.createElement("input");
    hiddenElm.name = "writerINPUT";
    hiddenElm.type = "text";
    hiddenElm.value = curVal;
    // hiddenElm.disabled = true;
    hiddenElm.style.display = "none";
    // aDiv.appendChild(hiddenElm);

    let List = document.getElementById("writerList") 
    let newElm = document.createElement("li");
    newElm.value = curVal;
    newElm.innerText = curVal;
    newElm.name = "writer"
   
    let ex = document.createElement("p");
    
    ex.className = "close";
    // ex.innerHTML = "&times;";
    
    // newElm.appendChild(ex);
    ex.appendChild(newElm);
    newElm.appendChild(hiddenElm)

   
    List.appendChild(ex)
    val[0].value = ''
    events();
}










/*______________________________________________________________________
  functionality
*/
function events(){
    // console.log("Deleting ")
var closebtns = document.getElementsByClassName("close");
var i;

for (i = 0; i < closebtns.length; i++) {
  closebtns[i].addEventListener("click", function() {
     
    // this.parentElement.style.display = 'none';
    // this.parentElement.remove();
    this.remove();
  });
}
}


