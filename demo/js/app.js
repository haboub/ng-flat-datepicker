(function() {

    'use strict';

    /**
     * Test code for ng-datepicker demo
     */
    angular
        .module('testApp', ['ngHijriGregorianDatepicker'])
        .controller('mainController', ['$scope', mainController]);

    function mainController ($scope) {
        $scope.hijriDatepickerConfig = {
            dateFormat: 'DD/MM/YYYY',
            gregorianDateFormat:  'DD/MM/YYYY',
            hijriDateFormat:  'iDD/iMM/iYYYY',
            allowPast: false,
            minDate: moment().subtract(5, 'years'),//for hijri subtract(5, 'iYear');
            allowFuture: false,
            maxDate: moment().add(5, 'years'),//for hijri add(5, 'iYear');
            defaultDisplay: 'hijri'
        };

        $scope.gregorianDatepickerConfig = {
            allowFuture: true,
            dateFormat: 'DD/MM/YYYY',
            defaultDisplay: 'gregorian'
        };


        //Demo related below
        moment.locale('en');
        $scope.locale = moment.locale();
        $scope.switchLocale = function( value ){
            moment.locale(value);
            $scope.locale = moment.locale();
        };
    }

})();
