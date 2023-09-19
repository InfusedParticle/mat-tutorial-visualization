const sheetId = "14JrjV7iRYoiyXalYuQfkNcwGpIO5VsNBgU7AxU9o6gk"
const base = `https://docs.google.com/spreadsheets/d/14JrjV7iRYoiyXalYuQfkNcwGpIO5VsNBgU7AxU9o6gk/gviz/tq?`
let qu = 'SELECT *'
const query = encodeURIComponent(qu)
const url = `${base}&sheet=Form%20Responses%201&tq=${query}`
const data = []
let divs = []

document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log("hi")
    let selectors = document.querySelectorAll('select');
    var instances = M.FormSelect.init(selectors);

    let modals = document.querySelectorAll('.modal');
    var instances2 = M.Modal.init(modals);

    let difficultyFilter = document.getElementById('difficulties')
    difficultyFilter.addEventListener('change', ()=>{
        let instance = M.FormSelect.getInstance(document.getElementById('difficulties'))
        console.log(instance.getSelectedValues())
    })

    let timeFilter = document.getElementById('times')
    let instance = M.FormSelect.getInstance(document.getElementById('times'))
    instance.input.value = "Tutorial Times"
    timeFilter.addEventListener('change', ()=>{
        console.log(instance.getSelectedValues());
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
    let tempTime = row[11]['f']
    time.innerHTML = tempTime.substring(0, tempTime.lastIndexOf(':')) + tempTime.substring(tempTime.lastIndexOf(' '))
    time.classList.add('time')

    let date = document.createElement("div")

    date.innerHTML = row[10]['f']
    d.appendChild(course);
    d.appendChild(date)
    d.appendChild(time);
    d.style.padding = "10px 15px 10px 15px";
    
    let tutorials = document.getElementById("onetime")
    tutorials.appendChild(d)

    
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
}