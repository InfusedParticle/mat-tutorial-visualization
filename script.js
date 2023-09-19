const sheetId = "14JrjV7iRYoiyXalYuQfkNcwGpIO5VsNBgU7AxU9o6gk"
const base = `https://docs.google.com/spreadsheets/d/14JrjV7iRYoiyXalYuQfkNcwGpIO5VsNBgU7AxU9o6gk/gviz/tq?`
let qu = 'SELECT *'
const query = encodeURIComponent(qu)
const url = `${base}&sheet=Form%20Responses%201&tq=${query}`
const data = []
let divs = []

document.addEventListener('DOMContentLoaded', init);

function init() {
    let selectors = document.querySelectorAll('select');
    var instances = M.FormSelect.init(selectors);

    let modals = document.querySelectorAll('.modal');
    var instances2 = M.Modal.init(modals);

    let difficultyFilter = document.getElementById('difficulties')
    difficultyFilter.addEventListener('change', ()=>{
        let instance = M.FormSelect.getInstance(document.getElementById('difficulties'))
        // console.log(instance.getSelectedValues())
        for(let i = 0; i < divs.length; i++) {
            let tempDiv = divs[i];
            if(!instance.getSelectedValues().includes(tempDiv.difficulty)) {
                tempDiv.style.display = 'none';
            } else {
                tempDiv.style.display = 'flex';
            }
        }
    })

    let timeFilter = document.getElementById('times')
    let instance = M.FormSelect.getInstance(document.getElementById('times'))
    instance.input.value = "Tutorial Times"
    timeFilter.addEventListener('change', ()=>{
        // console.log(instance.getSelectedValues());
        instance.input.value = "Tutorial Times"
    })
    let timeInstance = M.FormSelect.getInstance(document.getElementById('times'))

    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            let name = timeInstance.input.value;
            if(name === "Tutorial Times")
                return;
            else
                timeInstance.input.value = "Tutorial Times";
        });    
    });
    
    let target = timeInstance.dropdownOptions;
    observer.observe(target, { attributes : true, attributeFilter : ['style'] });

    fetch(url).then(res => res.text())
    .then(rep => {
        const jsData = JSON.parse(rep.substring(47).slice(0, -2))
        console.log(jsData);
        for(obj in jsData['table']['rows']) {
            let row = jsData['table']['rows'][obj]['c']
            console.log(row)
            if(row[5]['v'].includes('specific')) {
                // one-time tutorials
                oneTimeTutorial(row)
            }
            else {
                // reoccurring tutorial
                recurringTutorial(row)
            }
        }
        
    })
}

function oneTimeTutorial(row) {
    // check if tutorial has already happened
    let past = false;
    if(row[10] != null) {
        let dateData = row[10].v.slice(5, -1).split(",")
        let tutorialDate = new Date(parseInt(dateData[0]), parseInt(dateData[1]), parseInt(dateData[2]))
        let currentDate = new Date();
        if(tutorialDate < currentDate) {
            // add delete here
            // console.log('outdated tutorial');
            past = true;
        }
    }

    let d = document.createElement('div')
    d.className = (past) ? "card-panel grey lighten-1 tutorialslot" : "card-panel blue lighten-2 tutorialslot"
    let course = document.createElement('div')
    let courseName = document.createElement('div')
    let teacher = document.createElement('div')
    courseName.innerHTML = row[3].v;
    teacher.innerHTML = `<b>${row[2].v} - ${row[4].v}</b>`;
    teacher.classList.add('teacher')
    course.appendChild(courseName)
    course.appendChild(teacher)
    
    course.classList.add("course")
    
    let time = document.createElement("div")
    if(row[11] != null) {
        let tempTime = row[11]['f']
        time.innerHTML = tempTime.substring(0, tempTime.lastIndexOf(':')) + tempTime.substring(tempTime.lastIndexOf(' '))
    }
    time.classList.add('time')

    let date = document.createElement("div")
    if(row[10] != null) {
        date.innerHTML = row[10]['f']
    }

    d.appendChild(course);
    d.appendChild(date)
    d.appendChild(time);
    d.style.padding = "10px 15px 10px 15px";
    
    let tutorials = document.getElementById("onetime")
    tutorials.appendChild(d)
    // one-time modal
    d.addEventListener('click', ()=>{
        let modal = document.getElementById("tutorialmodal")
        let content = modal.querySelector('.modal-content')
        let header = content.querySelector('h4')
        header.innerHTML = row[3].v
        let modalBody = content.querySelector('p')
        modalBody.innerHTML = `hello`
        let instance = M.Modal.getInstance(modal)

        // one-time modal content
        let dateString = ``
        if(row[10] != null) {
            dateString = `${row[10]['f']} at ${time.innerHTML}`
        } else {
            dateString = `${row[12].v}`
        }
        let extraInfo = (row[13] != null) ? `${row[13].v}` : "None Provided"
        modalBody.innerHTML = `<b>Teacher</b><br>${row[2].v} - Room ${row[4].v}<br>${row[1].v}<br><br><b>Date</b><br>${dateString}<br><br><b>Additional Info</b><br>${extraInfo}`

        instance.open();
    })

    // add data to the div
    let courseString = row[3].v
    if(courseString.startsWith('AP')) {
        d.difficulty = 'AP';
    } else if(courseString.startsWith("KAP")) {
        d.difficulty = 'KAP';
    } else {
        d.difficulty = 'Academic';
    }
    let timeString = (row)
    divs.push(d)
}

function recurringTutorial(row) {
    let d = document.createElement('div')
    d.className = "card-panel blue lighten-2 tutorialslot"
    let course = document.createElement('div')
    let courseName = document.createElement('div')
    let teacher = document.createElement('div')
    courseName.innerHTML = row[3].v;
    teacher.innerHTML = `<b>${row[2].v} - ${row[4].v}</b>`;
    teacher.classList.add('teacher')
    course.appendChild(courseName)
    course.appendChild(teacher)
            
    course.classList.add("course")
            
    let time = document.createElement("div")
    time.innerHTML = row[7]['v']
    time.classList.add('time')
    let days = document.createElement("div")
    days.innerHTML = row[6]['v']

    d.appendChild(course);
    d.appendChild(days)
    d.appendChild(time);
    d.style.padding = "10px 15px 10px 15px";
    
    let tutorials = document.getElementById("recurring")
    tutorials.appendChild(d)
    // recurring modal
    d.addEventListener('click', ()=>{
        let modal = document.getElementById("tutorialmodal")
        let content = modal.querySelector('.modal-content')
        let header = content.querySelector('h4')
        header.innerHTML = row[3].v
        let modalBody = content.querySelector('p')
        
        // recurring modal content
        let repeatString = ``
        if(row[6] != null) {
            repeatString = `${row[6].v}<br>${row[7].v}`
        } else {
            repeatString = `${row[8].v}`
        }
        let extraInfo = (row[9] != null) ? `${row[9].v}` : "None Provided"
        modalBody.innerHTML = `<b>Teacher</b><br>${row[2].v} - Room ${row[4].v}<br>${row[1].v}<br><br><b>Repeats</b><br>${repeatString}<br><br><b>Additional Info</b><br>${extraInfo}`
        let instance = M.Modal.getInstance(modal)

        instance.open();
    })

    // add data to the div
    let courseString = row[3].v
    if(courseString.startsWith('AP')) {
        d.difficulty = 'AP';
    } else if(courseString.startsWith("KAP")) {
        d.difficulty = 'KAP';
    } else {
        d.difficulty = 'Academic';
    }
    divs.push(d)
}