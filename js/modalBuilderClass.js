class ModalBuilder {

    constructor(modalHeading) {
        this.heading = modalHeading
        this.modalBodyHTML = ''
    }

    appendBodyHeader(bodyHeader) {
        this.#addSpacingUnlessFirstHeader()
        this.modalBodyHTML += this.#getBold(bodyHeader)
        this.#appendNewline()
    }

    appendBodyText(bodySection) {
        this.modalBodyHTML += bodySection
        this.#appendNewline()
    }

    #addSpacingUnlessFirstHeader() {
        let isFirstHeader = this.modalBodyHTML.length == 0
        if(!isFirstHeader) {
            this.#appendNewline()
        }
    }

    #appendNewline() {
        this.modalBodyHTML += '<br>'
    }

    #getBold(bodyHeader) {
        return `<b>${bodyHeader}</b>`
    }

    openModal() {
        this.#buildModal()
        let modalInstance = M.Modal.getInstance(ModalBuilder.#getModalElement())
        modalInstance.open()
    }

    #buildModal() {
        let header = ModalBuilder.#getModalHeader()
        header.innerHTML = this.heading
        let modalBody = ModalBuilder.#getModalBody()
        modalBody.innerHTML = this.modalBodyHTML
    }

    static #getModalHeader() {
        return ModalBuilder.#getModalContent().querySelector('h4')
    }

    static #getModalBody() {
        return ModalBuilder.#getModalContent().querySelector('p')
    }

    static #getModalContent() {
        return ModalBuilder.#getModalElement().querySelector('.modal-content')
    }

    static #getModalElement() {
        return document.getElementById('tutorialmodal')
    }
}