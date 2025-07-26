class Calendar {
    /**
     * @param {HTMLElement} calendarElement 
     */
    constructor(calendarElement, selectedDate = null) {
        this.calendarElement = calendarElement;

        /**@type {HTMLElement} */
        this.monthYearDisplay = calendarElement.querySelector("#month_year_display");

        /**@type {HTMLButtonElement} */
        this.prevMonthButton = calendarElement.querySelector("#prev_month_button");
        /**@type {HTMLButtonElement} */
        this.nextMonthButton = calendarElement.querySelector("#next_month_button");

        /**@type {HTMLDivElement} */
        this.daysGridContainer = calendarElement.querySelector("#days_grid_container");

        this.selectedDate = new Date();
        this.currentMonthDisplay = new Date();
        this.today = new Date();


        this.monthNames = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];

        this.initEventListeners();

        if (selectedDate) {
            const displaySelectedDate = true;
            this.setSelectedDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), displaySelectedDate);
        } else {
            this.render();
        }
    }

    initEventListeners() {
        this.prevMonthButton.addEventListener("click", () => {
            this.currentMonthDisplay = new Date(this.currentMonthDisplay.getFullYear(), this.currentMonthDisplay.getMonth() - 1, 1);
            this.render();
        });
        this.nextMonthButton.addEventListener("click", () => {
            this.currentMonthDisplay = new Date(this.currentMonthDisplay.getFullYear(), this.currentMonthDisplay.getMonth() + 1, 1);
            this.render();
        });

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
            const dayCell = document.createElement("button");
            dayCell.innerHTML = daysCount;
            dayCell.classList.add("day_cell");
            if (isToday) {
                dayCell.classList.add("today");
            }
            if (isSelected) {
                dayCell.classList.add("selected");
            }

            dayCell.setAttribute("data-day", daysCount.toString());

            dayCell.addEventListener("click", () => {
                this.setSelectedDate(this.currentMonthDisplay.getFullYear(), this.currentMonthDisplay.getMonth(), daysCount);
            });

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


        this.monthYearDisplay.textContent = `${this.monthNames[this.currentMonthDisplay.getMonth()]} ${this.currentMonthDisplay.getFullYear()}`;
    }

    setSelectedDate(year, month, day, displaySelectedDate = false) {
        this.selectedDate.setDate(day);
        this.selectedDate.setMonth(month);
        this.selectedDate.setFullYear(year);

        if (displaySelectedDate) {
            this.currentMonthDisplay = new Date(year, month, 1);
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

const calendar = new Calendar(document.querySelector(".calendar"));