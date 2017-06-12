var iTitle          = document.getElementById("input"); // tekst zadatka
var iDate           = document.getElementById("inputDate");
var iTime           = document.getElementById("inputTime");
var kategorije      = document.getElementById("category");
var lista           = document.getElementById('lista');
var generalCounter  = document.getElementById("generalCounter");
var privateCounter  = document.getElementById("privateCounter");
var workCounter     = document.getElementById("workCounter");
var shoppingCounter = document.getElementById("shoppingCounter");
var doneCounter     = document.getElementById("doneCounter");
var archiveCounter  = document.getElementById("archiveCounter");
var overdueCounter  = document.getElementById("overdueCounter");
var tasks           = [];
var incremental     = 0;
var counters        = [0,0,0,0,0,0] 
var countersDOM     = [generalCounter,privateCounter,workCounter,shoppingCounter,doneCounter,archiveCounter]
var todayCounter    = 0;
var todayTask       = [];
var overdue         = [];
var todayCounterDOM = document.getElementById("todayCounter");
var izmjeniText     = document.getElementById("izmjeniText");
var idZaIzmjenu;
var kategorijaZaIzmjenu;
var currentTaskId;
var required_title  = document.getElementById("required_title");
var body = document.getElementsByTagName("body");


var todayRAW = new Date();
var dd = todayRAW.getDate();
var mm = todayRAW.getMonth()+1;
var yyyy = todayRAW.getFullYear();
if(dd<10) {
    dd='0'+dd
} 
if(mm<10) {
    mm='0'+mm
} 
today = dd+'/'+mm+'/'+yyyy;

function renderTask(taskData){
	
	var task_display = document.createElement("li");
	task_display.className = "view_task";
    task_display.category = taskData.category;
	task_display.setAttribute("id", taskData.id);
	

	var task_check = document.createElement("input");
    task_check.className = "checkbox";
	task_check.setAttribute("type", "checkbox");
    task_check.addEventListener("click", function (){
        taskModificator(this.parentNode.id,{state:1});
        this.parentNode.style.display = "none";
	});
	
	var title_display = document.createElement("p");
	title_display.className = "title_display";
	title_display.innerHTML = taskData.title;
	
	var datum_display = document.createElement("p");
	datum_display.className = "datum_display";
	datum_display.innerHTML = taskData.date;
	
	var time_display = document.createElement("p");
	var format_time = parseInt(taskData.time);
	if (format_time >= 0 && format_time < 12) {
		time_display.title = taskData.time + " AM";
	}
	else if (format_time >= 12) {
		time_display.title = taskData.time + " PM";
	}
	//time_display.title = taskData.time;
	time_display.className = "time_display";
	var time_span = document.createElement("span");
	time_span.className = "glyphicon glyphicon-time";
	
	var x_sign = document.createElement("button");
	x_sign.className = "close";
	x_sign.innerHTML = "<span>&times;</span>";
    if(taskData.state == 0){
	x_sign.addEventListener("click", function (){
		taskModificator(this.parentNode.id,{state:2});
        this.parentNode.style.display = "none";
	});
    }
    if(taskData.state == 1){
	x_sign.addEventListener("click", function (){
        updateCounter({state:1},-1)
        updateCounter({state:2},1)
		taskModificator(this.parentNode.id,{state:2});
        this.parentNode.style.display = "none";
	});
    }
	
	var edit = document.createElement("button");
	edit.className = "btn btn-warning btn-xs btn_position";
	edit.innerHTML = "Edit";
    edit.addEventListener("click", function(){
        idZaIzmjenu         = this.parentNode.id;
        kategorijaZaIzmjenu = this.parentNode.category;
        izmjeniText.value   = this.parentNode.title;
        $('#editModal').modal('show');
    })
   
    if(taskData.state == 1){task_check.setAttribute ("checked","true");task_display.style.opacity = "0.5";edit.style.display="none"}
    if(taskData.state == 2){task_check.style.display = "none";x_sign.style.display = "none";edit.style.display="none"};
	
	time_display.appendChild(time_span);
	
	task_display.appendChild(task_check);
	task_display.appendChild(title_display);
	task_display.appendChild(datum_display);
	task_display.appendChild(time_display);
	task_display.appendChild(x_sign);
	task_display.appendChild(edit);
	
	lista.appendChild(task_display);

}
	
//jquerry datum dropdown
$( function() {
    $("#inputDate").datepicker({
        onClose: function(dateText,inst){
           date = new Date(this.dateText);
        },
        dateFormat: 'dd/mm/yy'
    });
  } );

function newTask(){
	if (!/^(.{2,52})$/.test(iTitle.value)){ 
		required_title.style.display = "block";
		return;
	}
	required_title.style.display = "none";
    incremental++;
    var taskData = {title:iTitle.value,date:iDate.value,time:iTime.value,category:kategorije.options[kategorije.selectedIndex].value,state:0,id:incremental};
    tasks.push(taskData);
    renderTasks({category:taskData.category});
    iTitle.value = "";iTime.value=""; iDate.value="";
    updateCounter({category:taskData.category},1);
    localStore(taskData);
    todayCounterCheck(taskData);
}

function taskModificator(id,param){
    for(x in tasks){if(tasks[x].id == id)   {currentTask = tasks[x];break;}}
    if(typeof param.title != "undefined")   {currentTask.title    = param.title   ;}
    if(typeof param.date != "undefined")    {currentTask.date     = param.date    ;}
    if(typeof param.time != "undefined")    {currentTask.time     = param.time    ;}
    if(typeof param.category != "undefined"){updateCounter({category:currentTask.category},-1);
                                             updateCounter({category:param.category},1);
                                             currentTask.category = param.category;}
    if(typeof param.state != "undefined")   {if(currentTask.state == 0 && currentTask.state != param.state){
                                             updateCounter({category:currentTask.category},-1);
                                             updateCounter({state:param.state},1)
                                            }
                                             currentTask.state    = param.state   ;}
	for(x in todayTask){if(currentTask.id == todayTask[x].id){todayTask.splice(x, 1)}x--}
    for(x in overdue)  {if(currentTask.id == overdue[x].id)    {overdue.splice(x, 1)};x--}
	todayCounterCheck(currentTask);
    localStore(currentTask);
}

function renderTasks(m_category){
    refreshScreen();
    if(typeof m_category.category != "undefined" ){
    for(x in tasks){
        if(tasks[x].category == m_category.category && tasks[x].state == 0) renderTask(tasks[x])
        }
    }
    if(typeof m_category.state    != "undefined" ){
        for(x in tasks){
            if(tasks[x].state == m_category.state) renderTask(tasks[x])
        }
    }
}

function refreshScreen(){
    while (lista.firstChild) {
    lista.removeChild(lista.firstChild);
    }
}

function deleteTasks(param){
    if(typeof param.state != "undefined") {for(x in tasks){if(tasks[x].state == param.state){tasks.splice(x, 1);x--}}} // splice pazit
}

function updateCounter(param,num){
    if(typeof param.category != "undefined") {counters[param.category] += num;countersDOM[param.category].innerHTML = counters[param.category];};
    if(typeof param.state != "undefined")    {counters[param.state+3] += num;countersDOM[param.state+3].innerHTML =   counters[param.state+3];}
}

function todayCounterCheck(param){
    if (param.date!= "" && !dateIn(param.date) && param.state == 0)        { todayTask.push(param)};
    if (dateIn(param.date) < 0 && param.state == 0)     { overdue.push(param)};
    todayCounterDOM.innerHTML = todayTask.length;
    overdueCounter.innerHTML =  overdue.length;
}

function dateIn(param){
   var poljaDatuma = param.split("/");    //polja [0] = dd, polja[1] = mm, polja[2] = yy
   return (poljaDatuma[0]-todayRAW.getDate() + (poljaDatuma[1]-todayRAW.getMonth()+1)*30 + (poljaDatuma[2]-todayRAW.getFullYear())*365)-60;
}

function localStore(task){
	  chrome.storage.sync.set({[task.id]:task})
}

function load(){
        chrome.storage.sync.get(null,function(items){
			var ayy = Object.values(items)
		    for(x in ayy){
			var y = ayy[x];
			tasks.push(y);
			todayCounterCheck(y);
			if(y.id > incremental){incremental = y.id}
			if(y.state == 0) counters[y.category]++;
            else counters[y.state+3]++;	
			}
			for(var i = 0; i< 6;i++){countersDOM[i].innerHTML = counters[i]}
            renderTasks({category:0});
		})
}

function clearArchive(){
    for(var i = 0; i<tasks.length ; i++)
    {if(tasks[i].state == 2){chrome.storage.sync.remove(tasks[i].id.toString());tasks.splice(i, 1);i-- ;updateCounter({state:2},-1)}}
    renderTasks({state:2});
}

document.getElementById("activeG").addEventListener("click", function(){renderTasks({category:0});});
document.getElementById("activeP").addEventListener("click", function(){renderTasks({category:1});});
document.getElementById("activeW").addEventListener("click", function(){renderTasks({category:2});});
document.getElementById("activeS").addEventListener("click", function(){renderTasks({category:3});});
document.getElementById("activeC").addEventListener("click", function(){renderTasks({state:1});});
document.getElementById("activeA").addEventListener("click", function(){renderTasks({state:2});});

document.getElementById("activeO").addEventListener("click", function(){
	refreshScreen();
	for(x in overdue){renderTask(overdue[x]);}
});

document.getElementById("print").addEventListener("click", function(){printAll();});

document.getElementById("archive").addEventListener("click", function(){
	clearArchive();});
document.getElementById("todayRender").addEventListener("click", function(){
	refreshScreen();
	for(x in todayTask){renderTask(todayTask[x]);}
});
document.getElementById("addButton").addEventListener("click", function(){newTask();});
document.getElementById("editButton").addEventListener("click", function(){
	taskModificator(idZaIzmjenu,{title:izmjeniText.value});
	renderTasks({category:kategorijaZaIzmjenu});
	$('#editModal').modal('hide')});

function printAll(){
    var content = "<html>";
    content+="<b><center>Daily tasks for " + today + "</b></center>";
        content += "<br/>"+"<b>General</b>" + "<br/>";
            content=content.replace("undefined", "");
			for(x in todayTask){
				if(todayTask[x].category == 0){
            		content += "• " + todayTask[x].title + "<br/>";
				}
			}
        content += "<br/>"+"<b>Private</b>"+"<br/>";
            content=content.replace("undefined", "");
            for(x in todayTask){
				if(todayTask[x].category == 1){
            		content += "• " + todayTask[x].title + "<br/>";
				}
			}
        content += "<br/>"+"<b>Work</b>" +"<br/>";
            content=content.replace("undefined", "");
            for(x in todayTask){
				if(todayTask[x].category == 2){
            		content += "• " + todayTask[x].title + "<br/>";
				}
			}
        content +="<br/>"+ "<b>Shopping</b>"+ "<br/>";
            content=content.replace("undefined", "");
            for(x in todayTask){
				if(todayTask[x].category == 3){
            		content += "• " + todayTask[x].title + "<br/>";
				}
			}
            content=content.replace("undefined", "");
    content += "</body>";
    content += "</html>";

    var printWin = window.open('','','left=0,top=0,width=552,height=477,toolbar=0,scrollbars=0,status =0');
    printWin.document.write(content);
    printWin.document.close();
    printWin.focus();
    printWin.print();
    printWin.close();
}

$(document).ready(function() {
    load();
});
