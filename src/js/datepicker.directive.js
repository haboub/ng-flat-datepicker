(function() {

    'use strict';

    /**
     * @desc Datepicker directive
     * @example <ng-datepicker></ng-datepicker>
     */

    angular
        .module('ngHijriGregorianDatepicker', [])
        .directive('ngHijriGregorianDatepicker', ngHijriGregorianDatepickerDirective);

    function ngHijriGregorianDatepickerDirective($templateCache, $compile, $document, datesCalculator) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                config: '=datepickerConfig',
                selectedDate: '=selectedDate'
            },
            link: function(scope, element, attrs, ngModel) {

                var template     = angular.element($templateCache.get('datepicker.html'));
                var dateSelected = '';
                var today        = moment.utc();

                // Default options
                var defaultConfig = {
                    allowFuture: true,
                    dateFormat:  'DD/MM/YYYY',
                    gregorianDateFormat:  'DD/MM/YYYY',
                    hijriDateFormat:  'iDD/iMM/iYYYY',
                    minDate: null,
                    maxDate: null,
                    defaultDisplay: 'gregorian',//hijri,
                    locale: null
                };

                var locale = {
                    ar:{
                        gregorian: "ميلادي",
                        hijri: "هجري",
                    },
                    en:{
                        gregorian: "Gregorian",
                        hijri: "Hijri",
                    }
                };

                // Apply and init options
                scope.config = angular.extend(defaultConfig, scope.config);
                if (angular.isDefined(scope.config.locale)) moment.locale(scope.config.locale);
                if (angular.isDefined(scope.config.minDate)) moment.utc(scope.config.minDate).subtract(1, 'day');
                if (angular.isDefined(scope.config.maxDate)) moment.utc(scope.config.maxDate).add(1, 'day');
                scope.config.isRTL = ( moment.locale() === 'ar' || moment.locale() === 'ar-sa');
                setSwitchButtonVal();


                // Data
                scope.calendarCursor    = today;
                scope.currentWeeks      = [];
                scope.daysNameList      = datesCalculator.getDaysNames();
                scope.monthsList        = moment.months();
                scope.monthsInHijriList = moment.localeData()._iMonths;
                scope.yearsList         = datesCalculator.getYearsList();
                scope.yearsInHijriList  = datesCalculator.getYearsInHijriList();

                // Display
                scope.pickerDisplayed = false;

                scope.$watch(function(){ return ngModel.$modelValue; }, function(value){
                    if (value) {
                        dateSelected = scope.calendarCursor = moment.utc(value, scope.config.dateFormat);
                    }
                });

                scope.$watch('calendarCursor', function(val){
                    scope.currentWeeks = getiWeeks(val);
                });

                /**
                 * ClickOutside, handle all clicks outside the DatePicker when visible
                 */
                element.bind('click', function(e) {
                    scope.$apply(function(){
                        scope.pickerDisplayed = true;
                        $document.on('click', onDocumentClick);
                    });
                });

                function onDocumentClick(e) {
                    if (template !== e.target && !template[0].contains(e.target) && e.target !== element[0]) {
                        $document.off('click', onDocumentClick);
                        scope.$apply(function () {
                            scope.calendarCursor = dateSelected ? dateSelected : today;
                            scope.pickerDisplayed = scope.showMonthsList = scope.showYearsList = false;
                        });
                    }
                }

                init();

                /**
                 * Display the previous month in the datepicker
                 * @return {}
                 */
                scope.prevMonth = function() {
                    if(scope.config.defaultDisplay === 'gregorian'){
                        scope.calendarCursor = moment(scope.calendarCursor).subtract(1, 'months');
                    } else {
                        scope.calendarCursor = moment(scope.calendarCursor).subtract(1, 'iMonth');
                    }
                };

                /**
                 * Display the next month in the datepicker
                 * @return {}
                 */
                scope.nextMonth = function nextMonth() {
                    if(scope.config.defaultDisplay === 'gregorian'){
                        scope.calendarCursor = moment(scope.calendarCursor).add(1, 'months');
                    } else {
                        scope.calendarCursor = moment(scope.calendarCursor).add(1, 'iMonth');
                    }
                };

                /**
                 * Select a month and display it in the datepicker
                 * @param  {string} month The month selected in the select element
                 * @return {}
                 */
                scope.selectMonth = function selectMonth(month) {
                    scope.showMonthsList = false;
                    if(scope.config.defaultDisplay === 'gregorian'){
                        scope.calendarCursor = moment(scope.calendarCursor).month(month);
                    } else {
                        scope.calendarCursor = moment(scope.calendarCursor).iMonth(month);
                    }
                };

                /**
                 * Select a year and display it in the datepicker depending on the current month
                 * @param  {string} year The year selected in the select element
                 * @return {}
                 */
                scope.selectYear = function selectYear(year) {
                    scope.showYearsList = false;
                    if(scope.config.defaultDisplay === 'gregorian'){
                        scope.calendarCursor = moment(scope.calendarCursor).year(year);
                    } else {
                        scope.calendarCursor = moment(scope.calendarCursor).iYear(year);
                    }
                };

                /**
                 * Select a day
                 * @param  {[type]} day [description]
                 * @return {[type]}     [description]
                 */
                scope.selectDay = function(day) {
                    if (day.isSelectable && !day.isFuture || (scope.config.allowFuture && day.isFuture)) {
                        resetSelectedDays();
                        day.isSelected = true;
                        ngModel.$setViewValue(parseNumberToString(moment.utc(day.date).format(scope.config.dateFormat)));
                        scope.selectedDate = {
                            'hijri': parseNumberToString( moment.utc(day.date).format(scope.config.hijriDateFormat) ),
                            'gregorian': parseNumberToString( moment.utc(day.date).format(scope.config.gregorianDateFormat) )
                        };
                        ngModel.$render();
                        scope.pickerDisplayed = false;
                    }
                };

                /**
                 * Init the directive
                 * @return {}
                 */
                function init() {

                    element.parent().addClass('ng-hg-datepicker-wrapper');
                        //.wrap('<div class=""></div>');

                    $compile(template)(scope);
                    element.after(template);

                    if (angular.isDefined(ngModel.$modelValue) && moment.isDate(ngModel.$modelValue)) {
                        scope.calendarCursor = ngModel.$modelValue;
                    }
                }

                /**
                 * Get all weeks needed to display a month on the Datepicker
                 * @return {array} list of weeks objects
                 */
                function getWeeks (date) {

                    var weeks = [];
                    var date = moment.utc(date);
                    var firstDayOfMonth = moment(date).date(1);
                    var lastDayOfMonth  = moment(date).date(date.daysInMonth());

                    var startDay = moment(firstDayOfMonth);
                    var endDay   = moment(lastDayOfMonth);
                    // NB: We use weekday() to get a locale aware weekday
                    startDay = firstDayOfMonth.weekday() === 0 ? startDay : startDay.weekday(0);
                    endDay   = lastDayOfMonth.weekday()  === 6 ? endDay   : endDay.weekday(6);

                    var currentWeek = [];

                    for (var start = moment(startDay); start.isBefore(moment(endDay).add(1, 'days')); start.add(1, 'days')) {

                        var afterMinDate  = !scope.config.minDate || start.isAfter(scope.config.minDate, 'day');
                        var beforeMaxDate = !scope.config.maxDate || start.isBefore(scope.config.maxDate, 'day');
                        var isFuture      = start.isAfter(today);
                        var beforeFuture  = scope.config.allowFuture || !isFuture;

                        var day = {
                            date: moment(start).toDate(),
                            isToday: start.isSame(today, 'day'),
                            isInMonth: start.isSame(firstDayOfMonth, 'month'),
                            isSelected: start.isSame(dateSelected, 'day'),
                            isSelectable: afterMinDate && beforeMaxDate && beforeFuture
                        };

                        currentWeek.push(day);

                        if (start.weekday() === 6 || start === endDay) {
                            weeks.push(currentWeek);
                            currentWeek = [];
                        }
                    }

                    return weeks;
                }
                function getiWeeks (date) {

                    var weeks = [];
                    var date = moment.utc(date);
                    var firstDayOfMonth, lastDayOfMonth = null;

                    if(scope.config.defaultDisplay === 'gregorian'){
                        firstDayOfMonth = moment(date).date(1);
                        lastDayOfMonth  = moment(date).date(date.daysInMonth());
                    } else {
                        firstDayOfMonth = moment(date).iDate(1);
                        lastDayOfMonth  = moment(date).iDate(parseArabic(""+date.endOf('iMonth').format('iDD')));
                    }

                    var startDay = moment(firstDayOfMonth);
                    var endDay   = moment(lastDayOfMonth);
                    // NB: We use weekday() to get a locale aware weekday
                    startDay = firstDayOfMonth.weekday() === 0 ? startDay : startDay.weekday(0);
                    endDay   = lastDayOfMonth.weekday()  === 6 ? endDay   : endDay.weekday(6);

                    var currentWeek = [];

                    for (var start = moment(startDay); start.isBefore(moment(endDay).add(1, 'days')); start.add(1, 'days')) {

                        var afterMinDate  = !scope.config.minDate || start.isAfter(scope.config.minDate, 'day');
                        var beforeMaxDate = !scope.config.maxDate || start.isBefore(scope.config.maxDate, 'day');
                        var isFuture      = start.isAfter(today);
                        var beforeFuture  = scope.config.allowFuture || !isFuture;

                        var day = {
                            date: moment(start).toDate(),
                            isToday: start.isSame(today, 'day'),
                            isInMonth: start.isSame(firstDayOfMonth, 'month'),
                            isInHijriMonth: start.iMonth() === firstDayOfMonth.iMonth(),
                            isSelected: start.isSame(dateSelected, 'day'),
                            dayInHijri: parseArabic(""+start.format('iDD')),
                            day: parseArabic(""+start.format('DD')),

                            isSelectable: afterMinDate && beforeMaxDate && beforeFuture
                        };

                        currentWeek.push(day);

                        if (start.weekday() === 6 || start === endDay) {
                            weeks.push(currentWeek);
                            currentWeek = [];
                        }
                    }

                    return weeks;
                }
                function parseArabic(str) {
                    return Number( str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function(d) {
                        return d.charCodeAt(0) - 1632; // Convert Arabic numbers
                    }).replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function(d) {
                        return d.charCodeAt(0) - 1776; // Convert Persian numbers
                    }) );
                }
                function parseNumberToString(str) {
                    return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function(d) {
                        return d.charCodeAt(0) - 1632; // Convert Arabic numbers
                    }).replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function(d) {
                        return d.charCodeAt(0) - 1776; // Convert Persian numbers
                    });
                }

                scope.switchDate = function() {

                    if(scope.config.defaultDisplay === 'gregorian'){
                        scope.config.defaultDisplay = 'hijri';
                    } else {
                        scope.config.defaultDisplay = 'gregorian';
                    }
                    setSwitchButtonVal();

                    scope.currentWeeks = getiWeeks(scope.calendarCursor);
                    scope.showMonthsList = scope.showYearsList = false;
                }

                function setSwitchButtonVal(){
                    if(scope.config.defaultDisplay === 'gregorian' && moment.locale().startsWith("ar")) {
                        scope.switchButtonLabel = locale.ar.hijri;
                    } else if(scope.config.defaultDisplay === 'gregorian' && moment.locale().startsWith("en")){
                        scope.switchButtonLabel = locale.en.hijri;
                    } else if(scope.config.defaultDisplay === 'hijri' && moment.locale().startsWith("ar")) {
                        scope.switchButtonLabel = locale.ar.gregorian;
                    } else if(scope.config.defaultDisplay === 'hijri' && moment.locale().startsWith("en")){
                        scope.switchButtonLabel = locale.en.gregorian;
                    }
                }
                /**
                 * Reset all selected days
                 */
                function resetSelectedDays () {
                    scope.currentWeeks.forEach(function(week, wIndex){
                        week.forEach(function(day, dIndex){
                            scope.currentWeeks[wIndex][dIndex].isSelected = false;
                        });
                    });
                }
            }
        };
    }

})();
