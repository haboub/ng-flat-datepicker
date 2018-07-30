(function() {

    'use strict';

    /**
     * Test code for ng-datepicker demo
     */
    angular
        .module('testApp', ['ngHijriGregorianDatepicker'])
        .controller('mainController', ['$scope', mainController]);

    function mainController ($scope) {

        $scope.datepickerConfig = {
            allowFuture: true,
            dateFormat: 'DD/MM/YYYY',
            defaultDisplay: 'hijri'
        };

        $scope.datepickerConfig1 = {
            allowFuture: true,
            dateFormat: 'DD/MM/YYYY',
            defaultDisplay: 'gregorian'
        };
        moment.locale("ar");
    }

})();
