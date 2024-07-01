class Tutorial {
    constructor(tutorialDictionary) {
        this.emailAddress = tutorialDictionary[GeneralInfoColumns.emailAddress]['v']
        this.teacherName = tutorialDictionary[GeneralInfoColumns.teacherName]['v']
        this.mathSubject = tutorialDictionary[GeneralInfoColumns.mathSubject]['v']
        this.schoolLocation = tutorialDictionary[GeneralInfoColumns.schoolLocation]['v']
        this.tutorialDiv = this.#createBarebonesDiv()
        this.modalBuilder = new ModalBuilder(this.mathSubject)
        this.courseDifficulty = this.#getCourseDifficulty()
    }

    getDiv() {
        return this.tutorialDiv
    }

    displayDiv() {
        this.tutorialDiv.style.display = 'flex'
    }

    hideDiv() {
        this.tutorialDiv.style.display = 'none'
    }

    getValueOrNull(spreadsheetCell) {
        if(spreadsheetCell == null || spreadsheetCell['v'] == null)
            return null
        return spreadsheetCell['v']
    }

    appendTeacherSection() {
        this.modalBuilder.appendBodyHeader('Teacher')
        this.modalBuilder.appendBodyText(`${this.teacherName} - ${this.schoolLocation}`)
        this.modalBuilder.appendBodyText(`${this.emailAddress}`)
    }

    #createBarebonesDiv() {
        let barebonesDiv = document.createElement('div')
        barebonesDiv.className = 'card-panel blue lighten-2 tutorialslot'
        barebonesDiv.style.padding = '10px 15px 10px 15px'
        this.#addCourseAndTeacherTo(barebonesDiv)
        return barebonesDiv
    }

    #addCourseAndTeacherTo(tutorialDiv) {
        let courseAndTeacherDiv = document.createElement('div')
        this.#addCourseDivTo(courseAndTeacherDiv)
        this.#addTeacherDivTo(courseAndTeacherDiv)
        courseAndTeacherDiv.classList.add('course-and-teacher')
        tutorialDiv.appendChild(courseAndTeacherDiv)
    }

    #addCourseDivTo(courseAndTeacherDiv) {
        let courseDiv = document.createElement('div')
        courseDiv.innerHTML = this.mathSubject
        courseAndTeacherDiv.appendChild(courseDiv)
    }

    #addTeacherDivTo(courseAndTeacherDiv) {
        let teacher = document.createElement('div')
        teacher.innerHTML = this.#getBold(this.#getTeacherAndRoomString())
        teacher.classList.add('teacher')
        courseAndTeacherDiv.appendChild(teacher)
    }

    #getTeacherAndRoomString() {
        return `${this.teacherName} - ${this.schoolLocation}`
    }

    #getBold(htmlString) {
        return `<b>${htmlString}</b>`
    }

    #getCourseDifficulty() {
        if(this.mathSubject.startsWith('AP'))
            return 'AP'
        else if(this.mathSubject.startsWith('KAP'))
            return 'KAP'
        else
            return 'Academic'
    }
}

class RecurringTutorial extends Tutorial {
    constructor(tutorialDictionary) {
        super(tutorialDictionary)
        this.daysOfWeek = this.#getListOrNull(tutorialDictionary[RecurringInfoColumns.daysOfWeek])
        this.timesOfDay = this.#getListOrNull(tutorialDictionary[RecurringInfoColumns.timesOfDay])
        this.alternateDescription = this.getValueOrNull(tutorialDictionary[RecurringInfoColumns.alternateDescription])
        this.additionalInfo = this.getValueOrNull(tutorialDictionary[RecurringInfoColumns.additionalInfo])
        this.#finalizeTutorialDiv()
    }

    #getListOrNull(spreadsheetCell) {
        let cellValue = this.getValueOrNull(spreadsheetCell)
        if(cellValue == null)
            return null
        else
            return cellValue.split(', ')
    }

    compareTo(otherRecurringTutorial) {
        if(otherRecurringTutorial instanceof RecurringTutorial) {
            let thisDaysList = this.daysOfWeek
            let otherDaysList = otherRecurringTutorial.daysOfWeek

            if(thisDaysList == null || otherDaysList == null)
                return this.#compareNullLists(thisDaysList, otherDaysList)

            let daysComparison = this.#compareDayLists(thisDaysList, otherDaysList)
            if(daysComparison != 0)
                return daysComparison

            let thisTimesList = this.timesOfDay
            let otherTimesList = otherRecurringTutorial.timesOfDay

            if(thisTimesList == null || otherTimesList == null)
                return this.#compareNullLists(thisTimesList, otherTimesList)

            let timesComparison = this.#compareTimesLists(thisTimesList, otherTimesList)
            return timesComparison
        }
    }

    #compareNullLists(thisList, otherList) {
        if(thisList == null && otherList == null)
            return 0
        if(otherList == null)
            return -1
        if(thisList == null)
            return 1
    }

    #compareDayLists(thisList, otherList) {
        let minimumListLength = Math.min(thisList.length, otherList.length)
        for(let index = 0; index < minimumListLength; index++) {
            let thisDayValue = this.#getRelativeDay(thisList[index])
            let otherDayValue = this.#getRelativeDay(otherList[index])
            let daysDifference = thisDayValue - otherDayValue

            if(daysDifference != 0)
                return daysDifference
        }

        return thisList.length - otherList.length
    }

    #getRelativeDay(day) {
        let relativeDaysObject = {
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5
        }
        if(day == null || relativeDaysObject[day] == null)
            return 0

        return relativeDaysObject[day]
    }

    #compareTimesLists(thisList, otherList) {
        let minimumListLength = Math.min(thisList.length, otherList.length)
        for(let index = 0; index < minimumListLength; index++) {
            let thisTimeValue = this.#getRelativeTime(thisList[index])
            let otherTimeValue = this.#getRelativeTime(otherList[index])
            let timeDifference = thisTimeValue - otherTimeValue

            if(timeDifference != 0)
                return timeDifference
        }

        return thisList.length - otherList.length
    }

    #getRelativeTime(timeOfDay) {
        let relativeTimeObject = {
            'Before school': 1,
            'Enrichment': 2,
            'After school': 3
        }

        if(timeOfDay == null || relativeTimeObject[timeOfDay] == null)
            return 0

        return relativeTimeObject[timeOfDay]
    }

    filterByTimeAndDifficulty(selectedTimesArray, selectedDifficultiesArray) {
        if(this.#timeIsSelected(selectedTimesArray) && this.#difficultyIsSelected(selectedDifficultiesArray))
            this.displayDiv()
        else
            this.hideDiv()
    }

    #timeIsSelected(selectedTimesArray) {
        if(this.timesOfDay == null)
            return true

        for(let tutorialTime of this.timesOfDay) {
            if(selectedTimesArray.includes(tutorialTime))
                return true
        }

        return false
    }

    #difficultyIsSelected(selectedDifficultiesArray) {
        return selectedDifficultiesArray.includes(this.courseDifficulty)
    }

    #finalizeTutorialDiv() {
        this.#addDayDiv()
        this.#addTimeOfDayDiv()
        this.#addModalFunctionality()
    }

    #addDayDiv() {
        let dayDiv = document.createElement('div')
        if(this.daysOfWeek == null)
            dayDiv.innerHTML = 'Click for Description'
        else
            dayDiv.innerHTML = this.#getDayListDivText()

        this.tutorialDiv.appendChild(dayDiv)
    }

    #addTimeOfDayDiv() {
        let timeOfDayDiv = document.createElement('div')
        if(this.timesOfDay != null) {
            timeOfDayDiv.innerHTML = this.#listToString(this.timesOfDay)
        }
        timeOfDayDiv.classList.add('time')
        this.tutorialDiv.appendChild(timeOfDayDiv)
    }

    #listToString(list) {
        let commaSeparatedList = list.toString()
        let commaSpacedList = commaSeparatedList.replaceAll(',', ', ')
        return commaSpacedList
    }

    #getDayListDivText() {
        if(this.daysOfWeek.length >= 3) {
            let dayListClone = [...this.daysOfWeek]
            let shortenedDaysList = dayListClone.map((day) => this.#getShortenedDay(day))
            return this.#listToString(shortenedDaysList)
        } else {
            return this.#listToString(this.daysOfWeek)
        }
    }

    #getShortenedDay(day) {
        let shortenedDaysObject = {
            'Monday': 'M',
            'Tuesday': 'Tu',
            'Wednesday': 'W',
            'Thursday': 'Th',
            'Friday': 'F'
        }

        if(day == null || shortenedDaysObject[day] == null)
            return day
        else
            return shortenedDaysObject[day]
    }

    #addModalFunctionality() {
        this.#buildModal()
        this.tutorialDiv.addEventListener('click', ()=>{
            this.modalBuilder.openModal()
        })
    }

    #buildModal() {
        this.appendTeacherSection()
        this.#appendRepeatsSection()
        this.#appendAlternateDescriptionSection()
        this.#appendAdditionalInfoSection()
    }

    #appendRepeatsSection() {
        if(this.daysOfWeek != null && this.timesOfDay != null) {
            this.modalBuilder.appendBodyHeader('Repeats')
            this.modalBuilder.appendBodyText(this.#listToString(this.daysOfWeek))
            this.modalBuilder.appendBodyText(this.#listToString(this.timesOfDay))
        }
    }

    #appendAlternateDescriptionSection() {
        if(this.alternateDescription != null) {
            this.modalBuilder.appendBodyHeader('Tutorial Description')

            let descriptionLines = this.alternateDescription.split('\n')
            for(let line of descriptionLines) {
                this.modalBuilder.appendBodyText(`${line}`)
            }
        }
    }

    #appendAdditionalInfoSection() {
        this.modalBuilder.appendBodyHeader('Additional Information')
        if(this.additionalInfo == null)
            this.modalBuilder.appendBodyText('None Provided')
        else
        this.modalBuilder.appendBodyText(`${this.additionalInfo}`)
    }
}

class OneTimeTutorial extends Tutorial {
    constructor(tutorialDictionary) {
        super(tutorialDictionary)
        this.specificDate = tutorialDictionary[OneTimeInfoColumns.specificDate]['v']
        this.specificDateString = tutorialDictionary[OneTimeInfoColumns.specificDate]['f']
        this.specificTime = tutorialDictionary[OneTimeInfoColumns.specificTime]['v']
        this.specificTimeString = this.#extractTimeFromString(tutorialDictionary[OneTimeInfoColumns.specificTime]['f'])
        this.dateTimeObject = this.#getTutorialDateTime()
        this.timeOfDay = this.#getTimeOfDay()
        this.additionalInfo = this.getValueOrNull(tutorialDictionary[OneTimeInfoColumns.additionalInfo])
        
        this.#finalizeTutorialDiv()
    }

    compareTo(otherOneTimeTutorial) {
        if(otherOneTimeTutorial instanceof OneTimeTutorial)
            return this.dateTimeObject - otherOneTimeTutorial.dateTimeObject
        else
            return 0
    }

    filterByTimeAndDifficulty(selectedTimesArray, selectedDifficultiesArray) {
        if(this.#timeIsSelected(selectedTimesArray) && this.#difficultyIsSelected(selectedDifficultiesArray))
            this.displayDiv()
        else
            this.hideDiv()
    }

    #timeIsSelected(selectedTimesArray) {
        return selectedTimesArray.includes(this.timeOfDay)
    }

    #difficultyIsSelected(selectedDifficultiesArray) {
        return selectedDifficultiesArray.includes(this.courseDifficulty)
    }

    #finalizeTutorialDiv() {
        this.#addDateDiv()
        this.#addTimeDiv()
        this.#setDivColor()
        this.#addModalFunctionality()
    }

    #addDateDiv() {
        let dateDiv = document.createElement('div')
        dateDiv.innerHTML = this.specificDateString
        this.tutorialDiv.appendChild(dateDiv)
    }

    #addTimeDiv() {
        let timeDiv = document.createElement('div')
        timeDiv.innerHTML = this.specificTimeString
        timeDiv.classList.add('time')
        this.tutorialDiv.appendChild(timeDiv)
    }

    #setDivColor() {
        if(this.#isExpired())
            this.#makeDivGrey()
    }

    #isExpired() {
        return this.dateTimeObject < this.#getCurrentDateTime()
    }

    #getCurrentDateTime() {
        let rightNow = new Date()
        return rightNow
    }

    #makeDivGrey() {
        this.tutorialDiv.className = 'card-panel grey lighten-1 tutorialslot'
    }

    #addModalFunctionality() {
        this.#buildModal()
        this.tutorialDiv.addEventListener('click', ()=>{
            this.modalBuilder.openModal()
        })
    }

    #buildModal() {
        this.appendTeacherSection()
        this.#appendDateTimeSection()
        this.#appendAdditionalInfoSection()
    }

    #appendDateTimeSection() {
        this.modalBuilder.appendBodyHeader('Date')
        this.modalBuilder.appendBodyText(`${this.specificDateString} at ${this.specificTimeString}`)
    }

    #appendAdditionalInfoSection() {
        this.modalBuilder.appendBodyHeader('Additional Information')
        if(this.additionalInfo == null)
            this.modalBuilder.appendBodyText('None Provided')
        else
            this.modalBuilder.appendBodyText(`${this.additionalInfo}`)
    }

    #getTimeOfDay() {
        let schoolStartTime = this.#getSchoolStartTime()
        let schoolEndTime = this.#getSchoolEndTime()
        let tutorialTime = this.dateTimeObject

        if(tutorialTime < schoolStartTime)
            return 'Before school'
        else if(tutorialTime > schoolEndTime)
            return 'After school'
        else
            return 'Enrichment'
    }

    #getSchoolStartTime() {
        let startDateTime = this.#getTutorialDateTime()
        startDateTime.setHours(7, 10)   // 7:10am
        return startDateTime
    }

    #getSchoolEndTime() {
        let endDateTime = this.#getTutorialDateTime()
        endDateTime.setHours(14, 30)    // 2:30pm
        return endDateTime
    }

    #getTutorialDateTime() {
        let dateData = this.#getYearMonthDayObject()
        let timeData = this.#getHoursMinutesSecondsObject()
        let tutorialDateTime = new Date(dateData.year, dateData.monthIndex, dateData.day, timeData.hours, timeData.minutes, timeData.seconds)
        return tutorialDateTime
    }

    #getYearMonthDayObject() {
        let stringArray = this.specificDate.slice(5, -1).split(',')
        let yearMonthDayObject = {year: parseInt(stringArray[0]), monthIndex: parseInt(stringArray[1]), day: parseInt(stringArray[2])}
        return yearMonthDayObject
    }

    #getHoursMinutesSecondsObject() {
        let stringArray = this.specificTime.slice(5, -1).split(',')
        let hoursMinutesSecondsObject = {hours: parseInt(stringArray[3]), minutes: parseInt(stringArray[4]), seconds: parseInt(stringArray[5])}
        return hoursMinutesSecondsObject
    }

    #extractTimeFromString(timeString) {
        let formattedTime = this.#cutOffSeconds(timeString)
        let amOrPm = this.#getAMorPM(timeString)
        return `${formattedTime} ${amOrPm}`
    }

    #cutOffSeconds(timeString) {
        return timeString.substring(0, timeString.lastIndexOf(':'))
    }

    #getAMorPM(timeString) {
        return timeString.substring(timeString.lastIndexOf(' ')).trim()
    }
}