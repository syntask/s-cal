document.addEventListener('DOMContentLoaded', function() {

    const dateInputs = document.querySelectorAll('.s-cal-input');

    function createMonthView(parent, year, month){
        
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
                type: 'prev'
            });
        }
        daysBefore.reverse();

        // Create a collection of the dates we should show for the target month
        const days = [];
        for (let i = 1; i <= lastDate; i++) {
            days.push({
                date: new Date(year, month, i),
                day: i,
                type: 'primary'
            });
        }

        // Create a collection of the dates we should show for the following month
        const daysPadEnd = 42 - daysBefore.length - days.length;
        const daysAfter = [];
        for (let i = 1; i <= daysPadEnd; i++) {
            daysAfter.push({
                date: new Date(year, month + 1, i),
                day: i,
                type: 'next'
            });
        }

        // Combine the all the dates into a collection of all 42 dates that will be included in this view
        const alldays = [...daysBefore, ...days, ...daysAfter];

        // Initialize an empty HTML string that we will add the individual dates to
        var innerHtml = '';

        // Add the HTML for each of the dates we want to show in this view
        alldays.forEach(function(dayIndex) {

            // Construct the date object/button
            innerHtml += `
                <div class="s-cal-date s-cal-date-${dayIndex.type}" data-date-value="${dayIndex.date}">
                    <div class="s-cal-date-inner">
                        <div class="s-cal-date-top">
                        </div>
                        <div class="s-cal-date-middle">
                            <div class="s-cal-date-label">
                                ${dayIndex.day}
                            </div>
                        </div>
                        <div class="s-cal-date-bottom">
                            <div class="s-cal-dot hail"></div>
                            <div class="s-cal-dot wind"></div>
                            <div class="s-cal-dot torn"></div>
                        </div>
                    </div>
                </div>
            `;

        });

        monthView.innerHTML = innerHtml;

        // Append the monthView element to the parent element
        parent.appendChild(monthView);

    }



    dateInputs.forEach(function(dateInput) {

        let isScrolling;
        let blockScrollEvent = false;
        let viewportYear = 2020;
        let viewportMonth = 0;

        // If the date input has a date, set dateInput to that value, otherwise set to today's date.

        var dateSelected = dateInput.value ? new Date(dateInput.value) : new Date();

        // Set the hours, minutes and seconds to 0

        dateSelected.setHours(0, 0, 0, 0);

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
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
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

        const monthSelector = sCalPopup.querySelector('.s-cal-month-index');
        monthSelector.addEventListener('change', function() {
            viewportMonth = this.value;
            scrollMonthIntoView();
        });

        const monthPrev = sCalPopup.querySelector('.s-cal-month-prev');
        monthPrev.addEventListener('click', function() {
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
            viewportYear = this.value;
            scrollMonthIntoView();
        });

        const yearPrev = sCalPopup.querySelector('.s-cal-year-prev');
        yearPrev.addEventListener('click', function() {
            viewportYear = viewportYear - 1;
            yearSelector.value = viewportYear;
            scrollMonthIntoView();
        });

        const yearNext = sCalPopup.querySelector('.s-cal-year-next');
        yearNext.addEventListener('click', function() {
            viewportYear = viewportYear + 1;
            yearSelector.value = viewportYear;
            scrollMonthIntoView();
        });


        function scrollMonthIntoView(){
            const target = sCalPopup.querySelector('.s-cal-month-' + viewportYear + '-' + viewportMonth);
            target.scrollIntoView({behavior: 'smooth'});
            blockScrollEvent = true;
        }


        const sCalMonthDatesViewport = sCalPopup.querySelector('.s-cal-month-viewport');

        
        // For testing purposes right now, createMonthView() for january 2020 - december 2024
        // @TODO: createMonthView() for a range of dates specified in a date range, which should be specified when the script initializes
        // @TODO: Additionally, we will need to find a way to conditionally deactivate dates which are displayed for a month view but which fall outside the allowabel date range (for example, preventing a user from selecting a date that is in the future.)
        for (let i = 0; i < 12; i++) {
            createMonthView(sCalMonthDatesViewport, 2020, i);
        }
        for (let i = 0; i < 12; i++) {
            createMonthView(sCalMonthDatesViewport, 2021, i);
        }
        for (let i = 0; i < 12; i++) {
            createMonthView(sCalMonthDatesViewport, 2022, i);
        }
        for (let i = 0; i < 12; i++) {
            createMonthView(sCalMonthDatesViewport, 2023, i);
        }
        for (let i = 0; i < 12; i++) {
            createMonthView(sCalMonthDatesViewport, 2024, i);
        }


        function updateNav(){
            // Function to update the navigation elements to reflect the current viewport month and year

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
                    console.log(viewportMonth + '/' + viewportYear)
                }
            });

        }


        sCalMonthDatesViewport.addEventListener('scroll', function() {

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


        dateInput.addEventListener('click', function() {
            // @TODO: Open the popup when the date input element is clicked
        });
    });
});