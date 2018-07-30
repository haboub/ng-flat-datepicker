(function() {

    'use strict';

    /**
     * @desc Datepicker directive
     * @example <ng-datepicker></ng-datepicker>
     */

    ngHijriGregorianDatepickerDirective.$inject = ["$templateCache", "$compile", "$document", "datesCalculator"];
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

(function(){

    'use strict';

    /**
     * @desc Dates calculator factory
     */

     angular
         .module('ngHijriGregorianDatepicker')
         .factory('datesCalculator', datesCalculator);

    function datesCalculator () {

        /**
         * List all years for the select
         * @return {[type]} [description]
         */
        function getYearsList() {
            var yearsList = [];
            for (var i = 1991; i <= moment().year(); i++) {
                yearsList.push(i);
            }
            return yearsList;
        }

        /**
         * List all years in Hijri for the select
         * @return {[type]} [description]
         */
        function getYearsInHijriList() {
            var yearsList = [];
            for (var i = 1411; i <= moment().iYear(); i++) {
                yearsList.push(i);
            }
            return yearsList;
        }

        /**
         * List all days name in the current locale
         * @return {[type]} [description]
         */
        function getDaysNames () {
            var daysNameList = [];
            for (var i = 0; i < 7 ; i++) {
                daysNameList.push(moment().weekday(i).format('ddd'));
            }
            return daysNameList;
        }

        return {
            getYearsList: getYearsList,
            getYearsInHijriList: getYearsInHijriList,
            getDaysNames: getDaysNames
        };
    }

})();

angular.module('ngHijriGregorianDatepicker').run(['$templateCache', function($templateCache) {$templateCache.put('datepicker.html','\r\n<div class="ng-hg-datepicker" ng-show="pickerDisplayed">\r\n    <div class="ng-hg-datepicker-table-header-bckgrnd"></div>\r\n    <table ng-class="{rtl: config.isRTL }">\r\n        <caption>\r\n            <div class="ng-hg-datepicker-header-wrapper">\r\n\t\t\t\t<span class="ng-hg-datepicker-arrow ng-hg-datepicker-arrow-left" ng-click="prevMonth()">\r\n\t\t\t\t\t<svg version="1.0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="50" y="50" viewBox="0 0 100 100" xml:space="preserve">\r\n\t\t\t\t\t\t<polygon points="64.8,36.2 35.2,6.5 22.3,19.4 51.9,49.1 22.3,78.8 35.2,91.7 77.7,49.1" />\r\n\t\t\t\t\t</svg>\r\n\t\t\t\t</span>\r\n                <div class="ng-hg-datepicker-header-year">\r\n                    <div class="ng-hg-datepicker-custom-select-box" outside-click="showMonthsList = false">\r\n                        <span class="ng-hg-datepicker-custom-select-title ng-hg-datepicker-month-name" ng-click="showMonthsList = !showMonthsList; showYearsList = false" ng-class="{selected: showMonthsList }">{{  config.defaultDisplay == \'hijri\' ? calendarCursor.format(\'iMMMM\') :  calendarCursor.format(\'MMMM\') }}</span>\r\n                        <div class="ng-hg-datepicker-custom-select" ng-show="showMonthsList">                            <span ng-if="config.defaultDisplay == \'gregorian\'" ng-repeat="monthName in monthsList" ng-click="selectMonth(monthName); showMonthsList = false">{{ monthName }}</span><span ng-if="config.defaultDisplay == \'hijri\'" ng-repeat="monthName in monthsInHijriList" ng-click="selectMonth(monthName); showMonthsList = false">{{ monthName }}</span>                        </div>\r\n                    </div>\r\n                    <div class="ng-hg-datepicker-custom-select-box" outside-click="showYearsList = false">\r\n                        <span class="ng-hg-datepicker-custom-select-title" ng-click="showYearsList = !showYearsList; showMonthsList = false" ng-class="{selected: showYearsList }">{{ config.defaultDisplay == \'hijri\' ? calendarCursor.format(\'iYYYY\') : calendarCursor.format(\'YYYY\') }}</span>\r\n                        <div class="ng-hg-datepicker-custom-select" ng-show="showYearsList">                            <span ng-if="config.defaultDisplay == \'gregorian\'" ng-repeat="yearNumber in yearsList" ng-click="selectYear(yearNumber)">{{ yearNumber }}</span> <span ng-if="config.defaultDisplay == \'hijri\'" ng-repeat="yearNumber in yearsInHijriList" ng-click="selectYear(yearNumber)">{{ yearNumber }}</span>                        </div>\r\n                    </div>\r\n                </div>\r\n                <span class="ng-hg-datepicker-arrow ng-hg-datepicker-arrow-right" ng-click="nextMonth()">\r\n\t\t\t\t\t<svg version="1.0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="50" y="50" viewBox="0 0 100 100" xml:space="preserve">\r\n\t\t\t\t\t\t<polygon points="64.8,36.2 35.2,6.5 22.3,19.4 51.9,49.1 22.3,78.8 35.2,91.7 77.7,49.1" />\r\n\t\t\t\t\t</svg>\r\n\t\t\t\t</span>\r\n            </div>\r\n        </caption>\r\n        <tbody>\r\n        <tr class="days-head">\r\n            <td class="day-head" ng-repeat="dayName in daysNameList">{{ dayName }}</td>\r\n        </tr>\r\n        <tr class="days" ng-repeat="week in currentWeeks">\r\n            <td ng-repeat="day in week" ng-click="selectDay(day)" ng-class="[\'day-item\', { \'isToday\': day.isToday, \'isInMonth\': ( day.isInHijriMonth && config.defaultDisplay == \'hijri\') || ( day.isInMonth && config.defaultDisplay == \'gregorian\'), \'isDisabled\': !day.isSelectable, \'isSelected\': day.isSelected }]"><span ng-if="config.defaultDisplay == \'gregorian\'">{{ day.day }}</span><span ng-if="config.defaultDisplay == \'hijri\'">{{ day.dayInHijri }}</span></td>\r\n        </tr>\r\n        </tbody>\r\n    </table>\r\n    <button class="switchBtn" ng-click="switchDate()">{{switchButtonLabel}}</button>\r\n</div>\r\n');}]);