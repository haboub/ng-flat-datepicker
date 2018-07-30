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
