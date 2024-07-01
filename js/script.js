const spreadsheetID = '14JrjV7iRYoiyXalYuQfkNcwGpIO5VsNBgU7AxU9o6gk'
const BASE = `https://docs.google.com/spreadsheets/d/${spreadsheetID}/gviz/tq?`
const SQL = 'SELECT *'
const QUERY = encodeURIComponent(SQL)
const SPREADSHEET_URL = `${BASE}&sheet=Form%20Responses%201&tq=${QUERY}`

// hardcoded spreadsheet column letters (easy to edit if spreadsheet changes)
const GeneralInfoColumns = {
    emailAddress: 'B',
    teacherName: 'C',
    mathSubject: 'D',
    schoolLocation: 'N',
    oneTimeOrRecurring: 'E'
}

const RecurringInfoColumns = {
    daysOfWeek: 'F',
    timesOfDay: 'G',
    alternateDescription: 'H',
    additionalInfo: 'I'
}

const OneTimeInfoColumns = {
    specificDate: 'J',
    specificTime: 'K',
    alternateDescription: 'L',
    additionalInfo: 'M'
}

turnColumnLettersIntoNumbers(GeneralInfoColumns)
turnColumnLettersIntoNumbers(RecurringInfoColumns)
turnColumnLettersIntoNumbers(OneTimeInfoColumns)

function turnColumnLettersIntoNumbers(ColumnObject) {
    for (const [columnName, columnLetter] of Object.entries(ColumnObject)) {
        ColumnObject[columnName] = columnLetter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
    }
}

var oneTimeTutorialObjects = []
var recurringTutorialObjects = []
var allTutorialObjects = []

document.addEventListener('DOMContentLoaded', initialize)

function initialize() {
    initializeModals()
    initializeFilters()

    instantiateTutorialsFromSpreadsheet(SPREADSHEET_URL)
}

function initializeModals() {
    let modals = document.querySelectorAll('.modal')
    M.Modal.init(modals)
}

function initializeFilters() {
    let selectors = document.querySelectorAll('select')
    M.FormSelect.init(selectors)
    addDifficultyFilterFunctionality()
    addTimeFilterFunctionality()
}

function onFilterChange() {
    let timeFilter = document.getElementById('times')
    let timeFilterInstance = M.FormSelect.getInstance(timeFilter)
    let selectedTimes = timeFilterInstance.getSelectedValues()

    let difficultyFilter = document.getElementById('difficulties')
    let difficultyFilterInstance = M.FormSelect.getInstance(difficultyFilter)
    let selectedDifficulties = difficultyFilterInstance.getSelectedValues()

    for(let currentTutorial of allTutorialObjects) {
        currentTutorial.filterByTimeAndDifficulty(selectedTimes, selectedDifficulties)
    }
}

function addDifficultyFilterFunctionality() {
    let difficultyFilter = document.getElementById('difficulties')
    difficultyFilter.addEventListener('change', onFilterChange)
}

function addTimeFilterFunctionality() {
    let timeFilter = document.getElementById('times')
    let timeInstance = M.FormSelect.getInstance(timeFilter)
    timeInstance.input.value = 'Tutorial Times'

    timeFilter.addEventListener('change', onFilterChange)

    makeTimeFilterLabelPermanent()
}

function makeTimeFilterLabelPermanent() {
    let timeFilterInstance = M.FormSelect.getInstance(document.getElementById('times'))
    let observer = getTimeFilterObserver()
    let target = timeFilterInstance.dropdownOptions
    observer.observe(target, {attributes: true, attributeFilter: ['style']})
}

function getTimeFilterObserver() {
    let timeFilterObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function() {
            let timeFilterInstance = M.FormSelect.getInstance(document.getElementById('times'))
            timeFilterInstance.input.value = 'Tutorial Times'
        })
    })
    return timeFilterObserver
}

async function instantiateTutorialsFromSpreadsheet(sheetURL) {
    let allTutorialData = await getFormResponses(sheetURL)
    categorizeTutorials(allTutorialData)
    sortBothTutorialTypes()
    addAllTutorialDivs()
}

async function getFormResponses(sheetURL) {
    let spreadsheetResponse = await fetch(sheetURL)
    let parsedResponse = await spreadsheetResponse.text()
    let extractedJSON = extractJSON(parsedResponse)
    let sheetData = JSON.parse(extractedJSON)
    return sheetData['table']['rows']
}

function extractJSON(response) {
    return response.substring(47).slice(0, -2)
}

function categorizeTutorials(allTutorials) {
    for(let tutorialObject of allTutorials) {
        let tutorialDictionary = tutorialObject['c']

        if(tutorialIsOneTime(tutorialDictionary)) {
            handleOneTimeTutorial(tutorialDictionary)
        }
        else {
            handleRecurringTutorial(tutorialDictionary)
        }
    }
}

function tutorialIsOneTime(tutorialDictionary) {
    const tutorialType = tutorialDictionary[GeneralInfoColumns.oneTimeOrRecurring]['v']
    return tutorialType.includes('specific')
}

function handleOneTimeTutorial(tutorialDictionary) {
    let oneTimeTutorial = new OneTimeTutorial(tutorialDictionary)
    oneTimeTutorialObjects.push(oneTimeTutorial)
    allTutorialObjects.push(oneTimeTutorial)
}

function handleRecurringTutorial(tutorialDictionary) {
    let recurringTutorial = new RecurringTutorial(tutorialDictionary)
    recurringTutorialObjects.push(recurringTutorial)
    allTutorialObjects.push(recurringTutorial)
}

function sortBothTutorialTypes() {
    oneTimeTutorialObjects.sort(function(tutorial1, tutorial2) {
        return tutorial1.compareTo(tutorial2)
    })
    recurringTutorialObjects.sort(function(tutorial1, tutorial2) {
        return tutorial1.compareTo(tutorial2)
    })
}

function addAllTutorialDivs() {
    let oneTimeTutorialContainer = document.getElementById('onetime')
    addOneTimeTutorialsTo(oneTimeTutorialContainer)

    let recurringTutorialContainer = document.getElementById('recurring')
    addRecurringTutorialsTo(recurringTutorialContainer)
}

function addOneTimeTutorialsTo(oneTimeTutorialContainer) {
    for(let oneTimeTutorial of oneTimeTutorialObjects) {
        oneTimeTutorialContainer.appendChild(oneTimeTutorial.getDiv())
    }
}

function addRecurringTutorialsTo(recurringTutorialContainer) {
    for(let recurringTutorial of recurringTutorialObjects) {
        recurringTutorialContainer.appendChild(recurringTutorial.getDiv())
    }
}