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
            allowFuture: true,
            dateFormat: 'DD/MM/YYYY',
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
