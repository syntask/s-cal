// Version: 1.1.0

function formatDate(date, format) {
    // Argument 1 is "date" which is a Date object
    // Argument 2 is "format" which is a string defining the desired format using placeholders e.g. mm/dd/yyyy or dd-mm-yyyy
    // Returns a string with the date formatted as requested

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let dateStr = format;
    const replacements = {
        'dd': day < 10 ? '0' + day : day,
        'd': day,
        'mmmm': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1],
        'mmm': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1],
        'mm': month < 10 ? '0' + month : month,
        'm': month,
        'yyyy': year,
        'yy': year.toString().slice(-2),
        'y': year
    };

    for (const [key, value] of Object.entries(replacements)) {
        dateStr = dateStr.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
    }

    return dateStr;
}

function updateInputElement(targetElement, date, format) {
    const dateStr = formatDate(date, format)
    targetElement.value = dateStr;
}

function createMonthView(parent, popup, options, inputElement, year, month){
    
    // Accepts a year (e.g. 2023) and month 0-11 (zero based)
    
    const monthView = document.createElement('div');
    monthView.classList.add('s-cal-month');
    monthView.classList.add('s-cal-month-' + year + '-' + month)

    // Get the weekday that the first day of the target month falls on
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Get the last date of the target month
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Get the last date of the month before the target month
    const prevLastDate = new Date(year, month, 0).getDate();

    // Create a collection of the dates we should show from the previous month
    const daysPadStart = firstDayIndex
    const daysBefore = [];
    for (let i = 0; i < daysPadStart; i++) {
        daysBefore.push({
            date: new Date(year, month, 0 - i),
            day: prevLastDate - i,
            type: 'prev',
            // If the date is before options.min, add a value of 'disabled' to the key 'enabled'
            enabled: new Date(year, month, 0 - i) >= options.min
        });
    }
    daysBefore.reverse();

    // Create a collection of the dates we should show for the target month
    const days = [];
    for (let i = 1; i <= lastDate; i++) {
        days.push({
            date: new Date(year, month, i),
            day: i,
            type: 'primary',
            // If the date is before options.min or after options.max, add a value of 'disabled' to the key 'enabled'
            enabled: new Date(year, month, i) >= options.min && new Date(year, month, i) <= options.max
        });
    }

    // Create a collection of the dates we should show for the following month
    const daysPadEnd = 42 - daysBefore.length - days.length;
    const daysAfter = [];
    for (let i = 1; i <= daysPadEnd; i++) {
        daysAfter.push({
            date: new Date(year, month + 1, i),
            day: i,
            type: 'next',
            // If the date is after options.max, add a value of 'disabled' to the key 'enabled'
            enabled: new Date(year, month + 1, i) <= options.max
        });
    }

    // Combine the all the dates into a collection of all 42 dates that will be included in this view
    const alldays = [...daysBefore, ...days, ...daysAfter];

    // Initialize an empty HTML string that we will add the individual dates to
    var innerHtml = '';

    // Add the HTML for each of the dates we want to show in this view
    alldays.forEach(function(dayIndex) {

        const dateString = dayIndex.date.getFullYear() + '-' + dayIndex.date.getMonth() + '-' + dayIndex.date.getDate();

        if (dayIndex.enabled === false) {
            dayIndex.enabled = 'disabled';
        } else {
            dayIndex.enabled = 'enabled';
        }

        // Construct the date object/button
        innerHtml += `
            <div class="s-cal-date s-cal-date-${dayIndex.type} s-cal-date-${dateString} s-cal-date-${dayIndex.enabled}" data-date-value="${dateString}">
                <div class="s-cal-date-inner">
                    <div class="s-cal-date-top">
                    </div>
                    <div class="s-cal-date-middle">
                        <div class="s-cal-date-label">
                            ${dayIndex.day}
                        </div>
                    </div>
                    <div class="s-cal-date-bottom">
                        <div class="s-cal-dot one"></div>
                        <div class="s-cal-dot two"></div>
                        <div class="s-cal-dot three"></div>
                    </div>
                </div>
            </div>
        `;

    });

    monthView.innerHTML = innerHtml;

    // Append the monthView element to the parent element
    parent.appendChild(monthView);



    // Add an event listener to each of the date elements
    const dateElements = monthView.querySelectorAll('.s-cal-date.s-cal-date-primary.s-cal-date-enabled');

    dateElements.forEach(function(dateElement) {
        dateElement.addEventListener('click', function() {

            // Add the s-cal-date-active class to the selected date
            document.querySelectorAll('.s-cal-date').forEach(function(dateElement) {
                dateElement.classList.remove('s-cal-date-active');
            });

            this.classList.add('s-cal-date-active');

            // Get the date value but pad the month and day with a zero if they are less than 10
            // Also convert the month from 0-11 to 1-12
            const dateValue = this.dataset.dateValue.split('-');
            const monthValue = dateValue[1].length === 1 ? '0' + (parseInt(dateValue[1]) + 1) : (parseInt(dateValue[1]) + 1);
            const dayValue = dateValue[2].length === 1 ? '0' + dateValue[2] : dateValue[2];

            // Set the value of the inputElement to the selected date
            const selectedDate = new Date(dateValue[0], dateValue[1], dateValue[2]);
            updateInputElement(inputElement, selectedDate, options.format);

            // Dispatch a change event on the inputElement
            const changeEvent = new Event('change', {
                bubbles: true,
                cancelable: true,
            });
            inputElement.dispatchEvent(changeEvent);

            // Run the onChange function if it is defined
            if (options.onChangeFunction) {
                eval(options.onChangeFunction + `({
                    year: ${dateValue[0]},
                    month: ${dateValue[1]},
                    day: ${dateValue[2]},
                    });`);
            }

            // Close the popup
            if (options.persistant !== true) {
                popup.classList.remove('s-cal-popup-open');
            }
        });
    });

}



async function initSCal(inputElement, options) {

    // Add the readonly attribute to the inputElement
    inputElement.setAttribute('readonly', 'readonly');

    // Check if the inputElement has a valid value by checking if it fits the format YYYY-MM-DD

    if (!options.min){
        options.min = new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate());
    }

    if (!options.max){
        options.min = new Date(new Date().getFullYear() + 5, new Date().getMonth(), new Date().getDate());
    }

    if (!options.value){
        options.value = new Date();
    }

    if (!options.format){
        options.format = 'mm/dd/yyyy';
    }

    if (!options.showDots){
        options.showDots = false;
    }

    if (options.showDots){
        // Change the CSS so that s-cal-dot elements are visible
        document.head.insertAdjacentHTML('beforeend', `<style>
            .s-cal-dot {
                display: block;
            }
        </style>`);
    }

    let isScrolling;
    let blockScrollEvent = false;
    let viewportYear = options.value.getFullYear();
    let viewportMonth = options.value.getMonth();

    inputElement.classList.add('s-cal-input');

    // If the date input has a date, set inputElement to that value, otherwise set to today's date.

    // Create an s-cal-popup

    const sCalPopup = document.createElement('div');
    sCalPopup.classList.add('s-cal-popup');
    // Assign a unique Id to the sCalPopup using 's-cal-popup' + a uuid
    const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sCalPopup.id = 's-cal-popup-' + uuid;


    document.body.appendChild(sCalPopup);

    // Construct the navigation for the s-cal-popup

    sCalPopup.innerHTML = `
        <div class="s-cal-nav-wrapper">
            <div class="s-cal-nav-button s-cal-prev s-cal-month-prev">
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" fill="currentColor">
                    <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/>
                </svg>
            </div>
            <select class="s-cal-nav-button s-cal-select s-cal-month-index">
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
            </select>

            <div class="s-cal-nav-button s-cal-next s-cal-month-next">
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" fill="currentColor">
                    <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
                </svg>
            </div>

            <div class="s-cal-nav-spacer"></div>

            <div class="s-cal-nav-button s-cal-prev s-cal-year-prev">
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" fill="currentColor">
                    <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/>
                </svg>
            </div>
            <select class="s-cal-nav-button s-cal-select s-cal-year-index">
                ${Array.from({length: options.max.getFullYear() - options.min.getFullYear() + 1}, (_, k) => k + options.min.getFullYear()).map(year => `<option value="${year}">${year}</option>`).join('')}
            </select>
            <div class="s-cal-nav-button s-cal-next s-cal-year-next">
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" fill="currentColor">
                    <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
                </svg>
            </div>
        </div>

        <div class="s-cal-weekdays-wrapper">
            <div class="s-cal-weekday">Sun</div>
            <div class="s-cal-weekday">Mon</div>
            <div class="s-cal-weekday">Tue</div>
            <div class="s-cal-weekday">Wed</div>
            <div class="s-cal-weekday">Thu</div>
            <div class="s-cal-weekday">Fri</div>
            <div class="s-cal-weekday">Sat</div>
        </div>

        <div class="s-cal-month-viewport">
        </div>
    `;

    // @TODO: Disable navigation buttons when the min and max dates are reached
    const monthSelector = sCalPopup.querySelector('.s-cal-month-index');

    monthSelector.addEventListener('change', function() {
        // If the selected month is outside of the min and max dates, go to the nearest available year that will allow the selected month
        if (viewportYear === options.min.getFullYear() && this.value < options.min.getMonth()) {
            viewportYear = options.min.getFullYear() + 1;
        } else if (viewportYear === options.max.getFullYear() && this.value > options.max.getMonth()) {
            viewportYear = options.max.getFullYear() - 1;
        }
        viewportMonth = this.value;
        scrollMonthIntoView();
    });

    const monthPrev = sCalPopup.querySelector('.s-cal-month-prev');
    monthPrev.addEventListener('click', function() {
        if (this.classList.contains('disabled')) {
            return; // If the button is disabled, do nothing
        }
        if (viewportMonth - 1 < 0) {
            viewportMonth = 11;
            viewportYear -= 1;
            monthSelector.value = viewportMonth;
            yearSelector.value = viewportYear;
        } else {
            viewportMonth -= 1;
            monthSelector.value = viewportMonth;
        }
        scrollMonthIntoView();
    });

    const monthNext = sCalPopup.querySelector('.s-cal-month-next');
    monthNext.addEventListener('click', function() {
        if (this.classList.contains('disabled')) {
            return; // If the button is disabled, do nothing
        }
        if (viewportMonth + 1 > 11) {
            viewportMonth = 0;
            viewportYear += 1;
            monthSelector.value = viewportMonth;
            yearSelector.value = viewportYear;
        } else {
            viewportMonth += 1;
            monthSelector.value = viewportMonth;
        }
        scrollMonthIntoView();
    });

    const yearSelector = sCalPopup.querySelector('.s-cal-year-index')
    yearSelector.addEventListener('change', function() {

        // If the selected year places the target outside of the min and max dates, go to the nearest available month that will allow the selected year
        if (this.value <= options.min.getFullYear() && viewportMonth < options.min.getMonth()) {
            viewportYear = options.min.getFullYear();
            viewportMonth = options.min.getMonth();
            monthSelector.value = viewportMonth;
            yearSelector.value = viewportYear;
        } else if (this.value >= options.max.getFullYear() && viewportMonth > options.max.getMonth()) {
            viewportYear = options.max.getFullYear();
            viewportMonth = options.max.getMonth();
            monthSelector.value = viewportMonth;
            yearSelector.value = viewportYear;
        }

        viewportYear = this.value;
        scrollMonthIntoView();
    });

    const yearPrev = sCalPopup.querySelector('.s-cal-year-prev');
    yearPrev.addEventListener('click', function() {
        if (this.classList.contains('disabled')) {
            return; // If the button is disabled, do nothing
        }
        viewportYear = viewportYear - 1;
        yearSelector.value = viewportYear;
        scrollMonthIntoView();
    });

    const yearNext = sCalPopup.querySelector('.s-cal-year-next');
    yearNext.addEventListener('click', function() {
        if (this.classList.contains('disabled')) {
            return; // If the button is disabled, do nothing
        }
        viewportYear = viewportYear + 1;
        yearSelector.value = viewportYear;
        scrollMonthIntoView();
    });

    let currentMonthInView;

    function runViewChangeFunction(monthInView){
        if (options.onViewChangeFunction) {
            eval(options.onViewChangeFunction + `({
                currentMonthInView: monthInView,
                });`);
        }
    }

    function refreshMonthInView(){
        // Function to refresh the monthInView variable
        newCurrentMonthInView = sCalPopup.querySelector('.s-cal-month-' + viewportYear + '-' + viewportMonth);
        if (newCurrentMonthInView !== currentMonthInView) {
            currentMonthInView = newCurrentMonthInView;
            runViewChangeFunction(currentMonthInView);
        }
    }


    function scrollMonthIntoView(){
        const target = sCalPopup.querySelector('.s-cal-month-' + viewportYear + '-' + viewportMonth);
        target.scrollIntoView({behavior: 'smooth'});
        blockScrollEvent = true;

        // Call updateNavButtonStates function here, even though it will also be called by the scroll event listener, so that the navigation buttons are updated immediately
        updateNavButtonStates();
    }

    function updateNavButtonStates() {
        if (viewportYear <= options.min.getFullYear() && viewportMonth <= options.min.getMonth()) {
            monthPrev.classList.add('disabled');
        } else {
            monthPrev.classList.remove('disabled');
        }

        if (viewportYear >= options.max.getFullYear() && viewportMonth >= options.max.getMonth()) {
            monthNext.classList.add('disabled');
        } else {
            monthNext.classList.remove('disabled');
        }

        if (viewportYear <= options.min.getFullYear()) {
            yearPrev.classList.add('disabled');
        } else {
            yearPrev.classList.remove('disabled');
        }

        if (viewportYear >= options.max.getFullYear()) {
            yearNext.classList.add('disabled');
        } else {
            yearNext.classList.remove('disabled');
        }
    }


    const sCalMonthDatesViewport = sCalPopup.querySelector('.s-cal-month-viewport');

    
    // createMonthView for all the months from options.min to options.max (which are both Date objects)
    const minYear = options.min.getFullYear();
    const minMonth = options.min.getMonth();
    const maxYear = options.max.getFullYear();
    const maxMonth = options.max.getMonth();

    for (let y = minYear; y <= maxYear; y++) {
        for (let m = 0; m < 12; m++) {
            if (y === minYear && m < minMonth) {
                continue;
            }
            if (y === maxYear && m > maxMonth) {
                continue;
            }
            createMonthView(sCalMonthDatesViewport, sCalPopup, options, inputElement, y, m);
        }
    }

    // Scroll to the current month
    scrollMonthIntoView();

    // On load, set the active date to the initial value of the inputElement
    sCalPopup.querySelector('.s-cal-date-primary.s-cal-date-' + options.value.getFullYear() + '-' + options.value.getMonth() + '-' + options.value.getDate()).classList.add('s-cal-date-active');


    function updateNav(){
        // Function to update the navigation elements to reflect the current viewport month and year

        // Disable the navigation buttons if the min or max dates are reached
        updateNavButtonStates();

        const vwLeft = sCalMonthDatesViewport.getBoundingClientRect().left
        const vwRight = sCalMonthDatesViewport.getBoundingClientRect().right
        
        // Get all the possible months
        const monthInView = sCalMonthDatesViewport.querySelectorAll('.s-cal-month');
        
        // Programatically check each month to see if it is currently visible in the viewport
        monthInView.forEach(function(month) {

            const monthMid = month.getBoundingClientRect().left + (month.getBoundingClientRect().width / 2);

            if (monthMid > vwLeft && monthMid < vwRight) {
                // If the month is in view, update the monthSelector and yearSelector to reflect the month and year
                viewportMonth = parseInt(month.classList[1].split('-')[4]);
                viewportYear = parseInt(month.classList[1].split('-')[3]);
                monthSelector.value = viewportMonth;
                yearSelector.value = viewportYear;
            }
        });

    }


    sCalMonthDatesViewport.addEventListener('scroll', function() {
        refreshMonthInView();

        // Debounce the scroll event to detect when scrolling has ended
        clearTimeout(isScrolling);
        isScrolling = setTimeout(function () {
            blockScrollEvent = false;
            updateNav();
        }, 100);

        if (blockScrollEvent) {
            return;
        }
        updateNav();
    });


    inputElement.addEventListener('click', function() {
        // Open the popup when the date input element is clicked
        sCalPopup.classList.add('s-cal-popup-open');
    });

    // Close the popup when the user clicks outside of the popup
    document.addEventListener('click', function(event) {
        if (!sCalPopup.contains(event.target) && !inputElement.contains(event.target)) {
            sCalPopup.classList.remove('s-cal-popup-open');
        }
    });    
}