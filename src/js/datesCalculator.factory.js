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
        function getYearsList(config) {
            var startYear = config.minDate.year();
            var endYear = config.maxDate.year();
            if(!config.allowPast){
                startYear = moment().year();
            }
            if(!config.allowFuture){
                endYear = moment().year();
            }
            var yearsList = [];
            for (var i = startYear; i <= endYear; i++) {
                yearsList.push(i);
            }
            return yearsList;
        }

        /**
         * List all years in Hijri for the select
         * @return {[type]} [description]
         */
        function getYearsInHijriList(config) {
            var startYear = config.minDate.iYear();
            var endYear = config.maxDate.iYear();
            if(!config.allowPast){
                startYear = moment().iYear();
            }
            if(!config.allowFuture){
                endYear = moment().iYear();
            }
            var yearsList = [];
            for (var i = startYear; i <= endYear; i++) {
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
