class DatePicker {
    /**
     * @param {HTMLElement} calendarInput 
     */
    constructor(calendarInput) {
        this.rootElement = calendarInput;

        /**@type {HTMLElement} */
        this.monthYearDisplay = calendarInput.querySelector("#month_year_display");
        /**@type {HTMLElement} */
        this.calendar = calendarInput.querySelector("#calendar");
        /**@type {HTMLInputElement} */
        this.input = calendarInput.querySelector("input");
        /**@type {HTMLInputElement} */
        this.yearSelect = calendarInput.querySelector("#year_select");
        /**@type {HTMLInputElement} */
        this.monthSelect = calendarInput.querySelector("#month_select");

        /**@type {HTMLButtonElement} */
        this.prevMonthButton = calendarInput.querySelector("#prev_month_button");
        /**@type {HTMLButtonElement} */
        this.nextMonthButton = calendarInput.querySelector("#next_month_button");
        /**@type {HTMLButtonElement} */
        this.toggleCalendarButton = calendarInput.querySelector("#calendar_toggle_button");


        /**@type {HTMLDivElement} */
        this.daysGridContainer = calendarInput.querySelector("#days_grid_container");

        this.selectedDate = new Date();
        this.currentMonthDisplay = new Date();
        this.today = new Date();


        // day(1-2 digits), non-digit, month(1-2), non-digit, year(4), with optional surrounding whitespace, the delimiter can be whatever except a number
        // don't care about the spaces before or after.
        this.regexDateParser = /^\s*(\d{1,2})\D(\d{1,2})\D(\d{4})\s*$/;


        this.monthNames = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];

        this.initEventListeners();
        this.buildOptionsInSelect();
        this.initSelectedDateFromInput();
        this.selectOptionsFromMonthInDisplay();

    }

    initSelectedDateFromInput() {
        const value = this.input.value;
        const matches = value.match(this.regexDateParser);

        if (matches && this.isDateValid(matches)) {
            const day = parseInt(matches[1], 10);
            const month = parseInt(matches[2], 10) - 1;
            const year = parseInt(matches[3], 10);
            const displaySelectedDate = true;
            this.setSelectedDate(year, month, day, displaySelectedDate);
            this.reformatDateInInput({ day: this.selectedDate.getDate(), month: this.selectedDate.getMonth() + 1, year: this.selectedDate.getFullYear() });
        } else {
            if (value.trim().length != "") {
                this.input.classList.add("invalid");
            } else {
                this.reformatDateInInput({ day: this.currentMonthDisplay.getDate(), month: this.currentMonthDisplay.getMonth() + 1, year: this.currentMonthDisplay.getFullYear() });
            }
            this.render();
        }
    }

    selectOptionsFromMonthInDisplay() {
        try {
            this.yearSelect.querySelector(`option[value="${this.currentMonthDisplay.getFullYear()}"]`).selected = true;
            this.monthSelect.querySelector(`option[value="${this.currentMonthDisplay.getMonth()}"]`).selected = true;
        } catch {
            console.warn("Year or month option out of range of the select for the month being displayed.");
        }
    }

    selectOptionsFromSelectedDate() {
        try {
            this.yearSelect.querySelector(`option[value="${this.selectedDate.getFullYear()}"]`).selected = true;
            this.monthSelect.querySelector(`option[value="${this.selectedDate.getMonth()}"]`).selected = true;
        } catch {
            console.warn("Year or month option out of range of the select for the selected date.");
        }
    }

    buildOptionsInSelect() {
        for (let i = 0; i < this.monthNames.length; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.innerHTML = this.monthNames[i];
            this.monthSelect.appendChild(option);
        }

        let minYear = parseInt(this.rootElement.getAttribute("data-min-year"));
        let maxYear = parseInt(this.rootElement.getAttribute("data-max-year"));
        minYear = isNaN(minYear) ? 1900 : minYear;
        maxYear = isNaN(maxYear) ? this.today.getFullYear() + 10 : maxYear;

        for (let i = minYear; i <= maxYear; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.innerHTML = i;
            this.yearSelect.appendChild(option);
        }
    }

    initEventListeners() {
        this.prevMonthButton.addEventListener("click", () => this.navigateToPreviousMonth());
        this.nextMonthButton.addEventListener("click", () => this.navigateToNextMonth());
        this.toggleCalendarButton.addEventListener("click", () => this.toggleCalendarVisibility());
        document.addEventListener("click", (e) => this.handleOutsideClick(e));
        this.input.addEventListener("input", () => this.handleInputChange());
        this.input.addEventListener("blur", () => this.handleInputBlur());
        this.yearSelect.addEventListener("change", () => this.handleYearChange());
        this.monthSelect.addEventListener("change", () => this.handleMonthChange());
        this.daysGridContainer.addEventListener("click", (e) => this.handleDayClick(e));
    }

    navigateToPreviousMonth() {
        this.currentMonthDisplay = new Date(this.currentMonthDisplay.getFullYear(), this.currentMonthDisplay.getMonth() - 1, 1);
        this.selectOptionsFromMonthInDisplay();
        this.render();
    }

    navigateToNextMonth() {
        this.currentMonthDisplay = new Date(this.currentMonthDisplay.getFullYear(), this.currentMonthDisplay.getMonth() + 1, 1);
        this.selectOptionsFromMonthInDisplay();
        this.render();
    }

    toggleCalendarVisibility() {
        const isVisible = this.calendar.classList.toggle("visible");
        this.calendar.setAttribute("aria-hidden", !isVisible);
    }

    handleOutsideClick(e) {
        if (this.calendar.classList.contains("visible") && !this.rootElement.contains(e.target)) {
            this.calendar.classList.remove("visible");
            this.calendar.setAttribute("aria-hidden", "true");
        }
    }

    handleInputChange() {
        const value = this.input.value;
        const matches = value.match(this.regexDateParser);

        if (matches && this.isDateValid(matches)) {
            this.reformatDateInInput({
                day: parseInt(matches[1]),
                month: parseInt(matches[2]),
                year: parseInt(matches[3])
            });
            this.input.classList.remove("invalid");

            // Parse the input string into numbers
            let [, day, month, year] = matches.map(Number);
            this.setSelectedDate(year, month - 1, day, true);
        }
    }

    handleInputBlur() {
        const value = this.input.value;
        const matches = value.match(this.regexDateParser);

        if (!matches || !this.isDateValid(matches)) {
            this.input.classList.add("invalid");
            return;
        }

        this.reformatDateInInput({
            day: parseInt(matches[1]),
            month: parseInt(matches[2]),
            year: parseInt(matches[3])
        });
        this.input.classList.remove("invalid");
    }

    handleYearChange() {
        const value = this.yearSelect.value;
        this.currentMonthDisplay = new Date(value, this.currentMonthDisplay.getMonth(), 1);
        this.render();
    }

    handleMonthChange() {
        const value = this.monthSelect.value;
        this.currentMonthDisplay = new Date(this.currentMonthDisplay.getFullYear(), value, 1);
        this.render();
    }

    handleDayClick(e) {
        // Look on what kind of cells the user is clicking, if the cell is not "empty", 
        // we retrieve its data-attribute, the day, and we set the selected date.
        if (e.target.classList.contains("day_cell") && !e.target.classList.contains("empty")) {
            const day = parseInt(e.target.getAttribute("data-day"));
            this.setSelectedDate(this.currentMonthDisplay.getFullYear(), this.currentMonthDisplay.getMonth(), day);
            this.reformatDateInInput({
                day: day,
                month: this.currentMonthDisplay.getMonth() + 1,
                year: this.currentMonthDisplay.getFullYear()
            });
        }
    }

    /**
     * @param {{ day: number, month: number, year: number }} dateObj
     */
    reformatDateInInput({ day, month, year }) {
        const paddedDay = String(day).padStart(2, '0');
        const paddedMonth = String(month).padStart(2, '0');

        this.input.value = `${paddedDay}/${paddedMonth}/${year}`;
    }

    isDateValid(matches) {
        //parse the input string into number
        let [, day, month, year] = matches.map(Number);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }

    getNbrDaysInMonth() {
        const year = this.currentMonthDisplay.getFullYear();
        const month = this.currentMonthDisplay.getMonth();
        const lastDay = new Date(year, month + 1, 0);
        return lastDay.getDate();
    }

    getNbrDaysInPreviousMonth() {
        const prevMonthDisplay = new Date(this.currentMonthDisplay.getFullYear(), this.currentMonthDisplay.getMonth() - 1);
        const year = prevMonthDisplay.getFullYear();
        const month = prevMonthDisplay.getMonth();
        const lastDay = new Date(year, month + 1, 0);
        return lastDay.getDate();
    }


    render() {
        let counterDayCreated = 0;
        this.daysGridContainer.innerHTML = "";
        const nbrDaysInMonth = this.getNbrDaysInMonth();
        const nbrDaysInPrevMonth = this.getNbrDaysInPreviousMonth();
        this.currentMonthDisplay.setDate(1);

        //ternary to fix the non sense of the Americans. Their first day of the week is Sunday.
        const firstDayOfMonth = this.currentMonthDisplay.getDay() === 0 ? 6 : this.currentMonthDisplay.getDay() - 1;

        //empty cells to add at the beginning of the calendar so the first day of the month start at the correct day name.
        const nbrDaysInWeek = 7;
        const emptyCellsToAdd = nbrDaysInWeek - (nbrDaysInWeek - firstDayOfMonth);
        for (let i = emptyCellsToAdd; i > 0; i--) {
            const dayCell = document.createElement("div");
            dayCell.innerHTML = nbrDaysInPrevMonth - i + 1;
            dayCell.classList.add("day_cell", "empty");
            this.daysGridContainer.appendChild(dayCell);
            counterDayCreated++;
        }

        for (let daysCount = 1; daysCount <= nbrDaysInMonth; daysCount++) {
            this.currentMonthDisplay.setDate(daysCount);
            const isToday = this.today.getDate() == this.currentMonthDisplay.getDate() && this.today.getMonth() == this.currentMonthDisplay.getMonth() && this.today.getFullYear() == this.currentMonthDisplay.getFullYear();
            const isSelected = this.selectedDate.getDate() == this.currentMonthDisplay.getDate() && this.selectedDate.getMonth() == this.currentMonthDisplay.getMonth() && this.selectedDate.getFullYear() == this.currentMonthDisplay.getFullYear();
            const isWeekend = this.currentMonthDisplay.getDay() == 0 || this.currentMonthDisplay.getDay() == 6;
            const dayCell = document.createElement("button");
            dayCell.innerHTML = daysCount;
            dayCell.classList.add("day_cell");
            if (isToday) {
                dayCell.classList.add("today");
            }

            if (isSelected) {
                dayCell.classList.add("selected");
            }

            if (isWeekend) {
                dayCell.classList.add("week_end");
            }

            dayCell.setAttribute("data-day", daysCount.toString());
            this.daysGridContainer.appendChild(dayCell);
            counterDayCreated++;
        }


        let dayNextMonth = 1;
        const requiredNbrOfDaysToDisplay = 42;
        while (counterDayCreated < requiredNbrOfDaysToDisplay) {
            const dayCell = document.createElement("div");
            dayCell.innerHTML = dayNextMonth;
            dayCell.classList.add("day_cell", "empty");
            this.daysGridContainer.appendChild(dayCell);
            counterDayCreated++;
            dayNextMonth++;
        }
    }

    setSelectedDate(year, month, day, displaySelectedDate = false) {
        this.selectedDate.setDate(day);
        this.selectedDate.setMonth(month);
        this.selectedDate.setFullYear(year);

        if (displaySelectedDate) {
            this.currentMonthDisplay = new Date(year, month, 1);
            this.selectOptionsFromSelectedDate();
            this.render();
            return;
        }

        //if the selected date is the month being currently displayed, update the visual of the selected date
        if (month == this.currentMonthDisplay.getMonth() && year == this.currentMonthDisplay.getFullYear()) {
            const selectedDayCell = this.daysGridContainer.querySelector(".day_cell.selected");
            if (selectedDayCell)
                selectedDayCell.classList.remove("selected");

            this.daysGridContainer.querySelector(`[data-day="${day}"]`).classList.add("selected");
        }


    }
}

const calendar = new DatePicker(document.querySelector(".date_picker"));